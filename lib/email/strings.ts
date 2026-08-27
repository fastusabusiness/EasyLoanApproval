// Localized copy for applicant-facing loan emails, keyed by language.
// Each market maps to one language; anything unknown falls back to English.
// Myanmar deliberately stays English — no confident Burmese translation
// available (same caveat as the Myanmar form).
//
// Status labels/descriptions from STATUS_META remain English in all
// languages: they are the platform's canonical vocabulary and appear
// verbatim on the (English) status page the email links to.

export type EmailLocale = "en" | "id" | "pt" | "es";

const MARKET_LOCALE: Record<string, EmailLocale> = {
  US: "en",
  ID: "id",
  BR: "pt",
  MM: "en",
  MX: "es",
};

export function localeForMarket(market?: string): EmailLocale {
  return MARKET_LOCALE[market ?? "US"] ?? "en";
}

interface ConfirmationStrings {
  subject: (id: string) => string;
  preheader: (id: string) => string;
  heading: string;
  dear: (firstName: string) => string;
  received: (amount: string) => string;
  refLabel: string;
  keepRef: string;
  reviewTime: string;
  checkStatus: string;
  signoffHtml: string;
}

interface StatusChangeStrings {
  subject: (id: string) => string;
  preheader: (label: string) => string;
  heading: string;
  dear: (firstName: string) => string;
  changed: (labelHtml: string) => string;
  refLabel: string;
  checkStatus: string;
  thanksHtml: string;
}

export const CONFIRMATION_STRINGS: Record<EmailLocale, ConfirmationStrings> = {
  en: {
    subject: (id) =>
      `Your Easy Loan Approval application has been received — ${id}`,
    preheader: (id) => `Your Easy Loan Approval application reference is ${id}.`,
    heading: "Your application has been received",
    dear: (n) => `Dear ${n},`,
    received: (amount) =>
      `Thank you for submitting your loan application to Easy Loan Approval. We have successfully received your request for ${amount}, and it is now under review by our team.`,
    refLabel: "YOUR APPLICATION REFERENCE",
    keepRef:
      "Please retain this reference number — you will need it to check your application status at any time.",
    reviewTime:
      "Our team typically completes its review within 24 hours. You will receive a follow-up email as soon as a decision has been made.",
    checkStatus: "Check your status",
    signoffHtml: "Best regards,<br />The Easy Loan Approval Team",
  },
  id: {
    subject: (id) => `Permohonan Anda telah kami terima — ${id}`,
    preheader: (id) => `Nomor referensi permohonan Anda: ${id}.`,
    heading: "Permohonan Anda telah kami terima",
    dear: (n) => `Yth. ${n},`,
    received: (amount) =>
      `Terima kasih telah mengajukan permohonan pinjaman ke Easy Loan Approval. Permohonan Anda sebesar ${amount} telah kami terima dan sedang ditinjau oleh tim kami.`,
    refLabel: "NOMOR REFERENSI PERMOHONAN ANDA",
    keepRef:
      "Simpan nomor referensi ini — Anda memerlukannya untuk memeriksa status permohonan kapan saja.",
    reviewTime:
      "Tim kami biasanya menyelesaikan peninjauan dalam 24 jam. Anda akan menerima email lanjutan segera setelah keputusan dibuat.",
    checkStatus: "Cek status Anda",
    signoffHtml: "Hormat kami,<br />Tim Easy Loan Approval",
  },
  pt: {
    subject: (id) => `Recebemos seu pedido de empréstimo — ${id}`,
    preheader: (id) => `Sua referência do pedido: ${id}.`,
    heading: "Recebemos seu pedido de empréstimo",
    dear: (n) => `Prezado(a) ${n},`,
    received: (amount) =>
      `Obrigado por enviar seu pedido de empréstimo à Easy Loan Approval. Recebemos sua solicitação de ${amount}, que já está em análise pela nossa equipe.`,
    refLabel: "SUA REFERÊNCIA DO PEDIDO",
    keepRef:
      "Guarde este número de referência — você precisará dele para consultar o status do seu pedido a qualquer momento.",
    reviewTime:
      "Nossa equipe normalmente conclui a análise em até 24 horas. Você receberá um e-mail assim que houver uma decisão.",
    checkStatus: "Consultar status",
    signoffHtml: "Atenciosamente,<br />Equipe Easy Loan Approval",
  },
  es: {
    subject: (id) => `Hemos recibido tu solicitud de préstamo — ${id}`,
    preheader: (id) => `Tu referencia de solicitud: ${id}.`,
    heading: "Hemos recibido tu solicitud de préstamo",
    dear: (n) => `Estimado(a) ${n}:`,
    received: (amount) =>
      `Gracias por enviar tu solicitud de préstamo a Easy Loan Approval. Hemos recibido tu solicitud por ${amount} y nuestro equipo ya la está revisando.`,
    refLabel: "TU REFERENCIA DE SOLICITUD",
    keepRef:
      "Guarda este número de referencia — lo necesitarás para consultar el estado de tu solicitud en cualquier momento.",
    reviewTime:
      "Nuestro equipo normalmente completa la revisión en 24 horas. Recibirás un correo de seguimiento en cuanto haya una decisión.",
    checkStatus: "Consultar estado",
    signoffHtml: "Saludos cordiales,<br />El equipo de Easy Loan Approval",
  },
};

export const STATUS_CHANGE_STRINGS: Record<EmailLocale, StatusChangeStrings> = {
  en: {
    subject: (id) => `Update on your application — ${id}`,
    preheader: (label) => `Your application status changed to ${label}.`,
    heading: "Update on your application",
    dear: (n) => `Dear ${n},`,
    changed: (labelHtml) =>
      `We're writing to inform you that the status of your Easy Loan Approval application has been updated to ${labelHtml}.`,
    refLabel: "Application reference:",
    checkStatus: "Check your status",
    thanksHtml:
      "Thank you for choosing Easy Loan Approval.<br />Best regards,<br />The Easy Loan Approval Team",
  },
  id: {
    subject: (id) => `Pembaruan permohonan Anda — ${id}`,
    preheader: (label) =>
      `Status permohonan Anda berubah menjadi ${label}.`,
    heading: "Pembaruan status permohonan Anda",
    dear: (n) => `Yth. ${n},`,
    changed: (labelHtml) =>
      `Status permohonan Easy Loan Approval Anda telah diperbarui menjadi ${labelHtml}.`,
    refLabel: "Nomor referensi:",
    checkStatus: "Cek status Anda",
    thanksHtml:
      "Terima kasih telah memilih Easy Loan Approval.<br />Hormat kami,<br />Tim Easy Loan Approval",
  },
  pt: {
    subject: (id) => `Atualização do seu pedido — ${id}`,
    preheader: (label) => `O status do seu pedido mudou para ${label}.`,
    heading: "Atualização do seu pedido",
    dear: (n) => `Prezado(a) ${n},`,
    changed: (labelHtml) =>
      `O status do seu pedido na Easy Loan Approval foi atualizado para ${labelHtml}.`,
    refLabel: "Referência do pedido:",
    checkStatus: "Consultar status",
    thanksHtml:
      "Obrigado por escolher a Easy Loan Approval.<br />Atenciosamente,<br />Equipe Easy Loan Approval",
  },
  es: {
    subject: (id) => `Actualización de tu solicitud — ${id}`,
    preheader: (label) => `El estado de tu solicitud cambió a ${label}.`,
    heading: "Actualización de tu solicitud",
    dear: (n) => `Estimado(a) ${n}:`,
    changed: (labelHtml) =>
      `El estado de tu solicitud en Easy Loan Approval se ha actualizado a ${labelHtml}.`,
    refLabel: "Referencia de solicitud:",
    checkStatus: "Consultar estado",
    thanksHtml:
      "Gracias por elegir Easy Loan Approval.<br />Saludos cordiales,<br />El equipo de Easy Loan Approval",
  },
};

interface VerificationLinkStrings {
  subject: (label: string) => string;
  preheader: (label: string) => string;
  heading: (label: string) => string;
  dear: (firstName: string) => string;
  intro: (labelHtml: string) => string;
  whatToExpect: string;
  refLabel: string;
  copyLink: string;
  security: string;
  afterSubmit: string;
  questions: string;
  thanksHtml: string;
}

export const VERIFICATION_LINK_STRINGS: Record<EmailLocale, VerificationLinkStrings> = {
  en: {
    subject: (label) => `Action required: ${label} — Easy Loan Approval`,
    preheader: (label) => `Please complete: ${label}.`,
    heading: (label) => `Action needed: ${label}`,
    dear: (n) => `Dear ${n},`,
    intro: (labelHtml) =>
      `As part of processing your Easy Loan Approval application, we need you to complete one more step: ${labelHtml}. This helps us confirm your details and keep your application moving without delay.`,
    whatToExpect:
      "Clicking the button below will take you to a secure page — it only takes a couple of minutes. Please have any relevant documents or information on hand before you start.",
    refLabel: "YOUR APPLICATION REFERENCE",
    copyLink: "Or copy this link:",
    security:
      "Your information is kept secure, and completing this step does not affect your credit score.",
    afterSubmit:
      "Once submitted, our team will review it as part of your application — no further action is needed unless we reach out.",
    questions:
      "Questions, or trouble with the link? Just reply to this email and we'll help.",
    thanksHtml: "Thank you,<br />The Easy Loan Approval Team",
  },
  id: {
    subject: (label) => `Tindakan diperlukan: ${label} — Easy Loan Approval`,
    preheader: (label) => `Mohon selesaikan: ${label}.`,
    heading: (label) => `Tindakan diperlukan: ${label}`,
    dear: (n) => `Yth. ${n},`,
    intro: (labelHtml) =>
      `Sebagai bagian dari proses permohonan Easy Loan Approval Anda, kami memerlukan Anda untuk menyelesaikan satu langkah lagi: ${labelHtml}. Langkah ini membantu kami memverifikasi data Anda dan memastikan permohonan Anda tetap diproses tanpa penundaan.`,
    whatToExpect:
      "Klik tombol di bawah untuk membuka halaman aman — prosesnya hanya memakan waktu beberapa menit. Siapkan dokumen atau informasi terkait sebelum memulai.",
    refLabel: "NOMOR REFERENSI PERMOHONAN ANDA",
    copyLink: "Atau salin tautan ini:",
    security:
      "Data Anda tersimpan dengan aman, dan langkah ini tidak memengaruhi skor kredit Anda.",
    afterSubmit:
      "Setelah selesai, tim kami akan meninjaunya sebagai bagian dari permohonan Anda — tidak ada tindakan lain yang diperlukan kecuali kami menghubungi Anda kembali.",
    questions:
      "Ada pertanyaan atau kendala dengan tautan ini? Cukup balas email ini dan kami akan membantu.",
    thanksHtml: "Terima kasih,<br />Tim Easy Loan Approval",
  },
  pt: {
    subject: (label) => `Ação necessária: ${label} — Easy Loan Approval`,
    preheader: (label) => `Por favor, conclua: ${label}.`,
    heading: (label) => `Ação necessária: ${label}`,
    dear: (n) => `Prezado(a) ${n},`,
    intro: (labelHtml) =>
      `Como parte do processamento do seu pedido na Easy Loan Approval, precisamos que você conclua mais uma etapa: ${labelHtml}. Isso nos ajuda a confirmar seus dados e manter seu pedido em andamento sem atrasos.`,
    whatToExpect:
      "Ao clicar no botão abaixo, você será direcionado a uma página segura — isso leva apenas alguns minutos. Tenha em mãos os documentos ou informações necessárias antes de começar.",
    refLabel: "SUA REFERÊNCIA DO PEDIDO",
    copyLink: "Ou copie este link:",
    security:
      "Seus dados são mantidos em sigilo, e concluir esta etapa não afeta sua pontuação de crédito.",
    afterSubmit:
      "Após o envio, nossa equipe analisará como parte do seu pedido — nenhuma outra ação é necessária, a menos que entremos em contato.",
    questions:
      "Dúvidas ou problemas com o link? Basta responder a este e-mail que ajudaremos.",
    thanksHtml: "Obrigado,<br />Equipe Easy Loan Approval",
  },
  es: {
    subject: (label) => `Acción requerida: ${label} — Easy Loan Approval`,
    preheader: (label) => `Por favor completa: ${label}.`,
    heading: (label) => `Acción requerida: ${label}`,
    dear: (n) => `Estimado(a) ${n}:`,
    intro: (labelHtml) =>
      `Como parte del procesamiento de tu solicitud en Easy Loan Approval, necesitamos que completes un paso más: ${labelHtml}. Esto nos ayuda a confirmar tus datos y mantener tu solicitud en proceso sin demoras.`,
    whatToExpect:
      "Al hacer clic en el botón de abajo, irás a una página segura — solo toma un par de minutos. Ten a la mano los documentos o información necesarios antes de comenzar.",
    refLabel: "TU REFERENCIA DE SOLICITUD",
    copyLink: "O copia este enlace:",
    security:
      "Tu información se mantiene segura, y completar este paso no afecta tu puntaje crediticio.",
    afterSubmit:
      "Una vez enviado, nuestro equipo lo revisará como parte de tu solicitud — no se necesita ninguna otra acción a menos que te contactemos.",
    questions:
      "¿Tienes preguntas o problemas con el enlace? Responde a este correo y te ayudaremos.",
    thanksHtml: "Gracias,<br />El equipo de Easy Loan Approval",
  },
};
