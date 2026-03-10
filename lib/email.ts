import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendFeedbackNotification(email: string, title: string) {
    try {
        await resend.emails.send({
            from: "RashtraKosh <noreply@rashtrakosh.example.com>",
            to: email,
            subject: "Feedback Received",
            html: `<p>We have successfully received your feedback regarding: <strong>${title}</strong></p><p>Thank you for contributing to RashtraKosh.</p>`
        });
    } catch (error) {
        console.error("Failed to send email", error);
    }
}
