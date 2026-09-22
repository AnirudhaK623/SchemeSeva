import { Reservation } from '../../src/types/orchestrator.js';
import { ResourceManager } from './resource_manager.js';

export class ReservationManager {
  private reservations: Map<string, Reservation> = new Map();
  private defaultExpiryWindowSec = 25; // 25s window before reservation expires
  public successfulReservationsCount = 0;
  public reservationCancellationsCount = 0;

  constructor(private resourceManager: ResourceManager) {}

  public reset(): void {
    this.reservations.clear();
    this.successfulReservationsCount = 0;
    this.reservationCancellationsCount = 0;
  }

  public getAllReservations(): Reservation[] {
    return Array.from(this.reservations.values());
  }

  public getActiveReservations(): Reservation[] {
    return Array.from(this.reservations.values()).filter(r => r.status === 'ACTIVE');
  }

  public getActiveReservation(workflowId: string, agentId: string, resourceId: string): Reservation | undefined {
    return Array.from(this.reservations.values()).find(
      r => r.workflow_id === workflowId && r.agent_id === agentId && r.resource_id === resourceId && r.status === 'ACTIVE'
    );
  }

  public createReservation(
    workflowId: string,
    agentId: string,
    resourceId: string,
    expectedUsageDelaySec: number = 5
  ): Reservation | null {
    // Check if already reserved
    const existing = this.getActiveReservation(workflowId, agentId, resourceId);
    if (existing) {
      return existing;
    }

    // Attempt to claim a reservation slot in resourceManager
    const slotAcquired = this.resourceManager.addReservationSlot(resourceId);
    if (!slotAcquired) {
      return null;
    }

    const now = Date.now();
    const reservation: Reservation = {
      reservation_id: `RES-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
      workflow_id: workflowId,
      agent_id: agentId,
      resource_id: resourceId,
      status: 'ACTIVE',
      creation_time: now,
      expected_usage_time: now + (expectedUsageDelaySec * 1000),
      expiry_time: now + ((expectedUsageDelaySec + this.defaultExpiryWindowSec) * 1000)
    };

    this.reservations.set(reservation.reservation_id, reservation);
    this.successfulReservationsCount++;
    return reservation;
  }

  public promoteReservation(reservationId: string): boolean {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'ACTIVE') return false;

    res.status = 'PROMOTED';
    // When promoted to allocation, resource_manager handles slot transition
    return true;
  }

  public releaseReservation(reservationId: string): boolean {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'ACTIVE') return false;

    res.status = 'RELEASED';
    res.release_time = Date.now();
    this.resourceManager.removeReservationSlot(res.resource_id);
    return true;
  }

  public cancelWorkflowReservations(workflowId: string): Reservation[] {
    const cancelled: Reservation[] = [];
    for (const res of this.reservations.values()) {
      if (res.workflow_id === workflowId && res.status === 'ACTIVE') {
        res.status = 'CANCELLED';
        res.release_time = Date.now();
        this.resourceManager.removeReservationSlot(res.resource_id);
        this.reservationCancellationsCount++;
        cancelled.push(res);
      }
    }
    return cancelled;
  }

  public cleanExpiredReservations(): Reservation[] {
    const now = Date.now();
    const expired: Reservation[] = [];
    for (const res of this.reservations.values()) {
      if (res.status === 'ACTIVE' && now > res.expiry_time) {
        res.status = 'EXPIRED';
        res.release_time = now;
        this.resourceManager.removeReservationSlot(res.resource_id);
        this.reservationCancellationsCount++;
        expired.push(res);
      }
    }
    return expired;
  }
}
