import emailjs from '@emailjs/browser';

export interface EmailOtpParams {
  to_name: string;
  to_email: string;
  otp_code: string;
  assigned_agent: string;
  scheme_name?: string;
}

export interface EmailSendResult {
  sent: boolean;
  status: number | string;
  message: string;
  provider: 'emailjs' | 'simulated';
}

// Retrieve public configuration from Vite environment variables or localStorage overrides
export const getEmailJsConfig = () => {
  const serviceId =
    (typeof window !== 'undefined' && localStorage.getItem('scheme_seva_emailjs_service_id')) ||
    import.meta.env.VITE_EMAILJS_SERVICE_ID ||
    '';
  const templateId =
    (typeof window !== 'undefined' && localStorage.getItem('scheme_seva_emailjs_template_id')) ||
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID ||
    '';
  const publicKey =
    (typeof window !== 'undefined' && localStorage.getItem('scheme_seva_emailjs_public_key')) ||
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY ||
    '';

  return { serviceId, templateId, publicKey, isConfigured: Boolean(serviceId && templateId && publicKey) };
};

/**
 * Save user custom EmailJS configuration to browser local storage if entered in settings
 */
export const saveEmailJsConfig = (serviceId: string, templateId: string, publicKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('scheme_seva_emailjs_service_id', serviceId.trim());
    localStorage.setItem('scheme_seva_emailjs_template_id', templateId.trim());
    localStorage.setItem('scheme_seva_emailjs_public_key', publicKey.trim());
  }
};

/**
 * Sends real email OTP via EmailJS if credentials are provided,
 * otherwise provides an immediate transparent simulation preview.
 */
export async function sendOtpEmail(params: EmailOtpParams): Promise<EmailSendResult> {
  const config = getEmailJsConfig();

  if (config.isConfigured) {
    try {
      const templateParams = {
        to_name: params.to_name,
        to_email: params.to_email,
        otp_code: params.otp_code,
        assigned_agent: params.assigned_agent,
        scheme_name: params.scheme_name || 'SchemeSeva Welfare Application',
        message: `Your SchemeSeva statutory e-KYC Verification OTP is ${params.otp_code}. Valid for 10 minutes. Assigned Agent: ${params.assigned_agent}`
      };

      const response = await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.publicKey
      );

      return {
        sent: true,
        status: response.status,
        message: `Live email OTP dispatched to ${params.to_email} via EmailJS.`,
        provider: 'emailjs'
      };
    } catch (err: any) {
      console.warn('EmailJS live send warning:', err);
      return {
        sent: false,
        status: 'EMAILJS_ERROR',
        message: `EmailJS dispatch failed (${err?.text || err?.message || 'Check template/keys'}). Fallback code displayed on screen.`,
        provider: 'simulated'
      };
    }
  }

  // Fallback transparent sandbox mode
  return {
    sent: true,
    status: 200,
    message: `OTP delivered to ${params.to_email} (Sandbox mode active; live EmailJS keys optional in Settings).`,
    provider: 'simulated'
  };
}
