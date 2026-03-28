/**
 * WhatsApp via UltraMsg (https://ultramsg.com).
 * Trial gratuito: 1.000 mensagens sem cartão.
 *
 * Variáveis necessárias no .env:
 *   ULTRAMSG_INSTANCE_ID  → ex: instance167596
 *   ULTRAMSG_TOKEN        → token da instância
 *   THERAPIST_WHATSAPP_NUMBER → só dígitos, sem + (ex: 5511999999999)
 */

/**
 * Envia mensagem via WhatsApp (UltraMsg).
 * Fire-and-forget: falhas são apenas logadas, nunca propagadas,
 * para não bloquear o agendamento.
 */
export async function sendWhatsAppMessage(message: string): Promise<void> {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID?.trim()
  const token      = process.env.ULTRAMSG_TOKEN?.trim()
  const phone      = process.env.THERAPIST_WHATSAPP_NUMBER?.trim()

  if (!instanceId || !token || !phone) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WhatsApp] ULTRAMSG_INSTANCE_ID, ULTRAMSG_TOKEN ou THERAPIST_WHATSAPP_NUMBER não configurados.')
    }
    return
  }

  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        to: `${phone}@c.us`,
        body: message,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok || data.sent !== 'true') {
      console.error('[WhatsApp] UltraMsg erro:', data)
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[WhatsApp] Mensagem enviada com sucesso via UltraMsg.')
    }
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar mensagem:', error)
  }
}
