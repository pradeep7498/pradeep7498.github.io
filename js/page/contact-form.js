/**
 * Contact form: checks the fields, then sends the message to your inbox
 * through FormSubmit (https://formsubmit.co). No server needed.
 *
 * First use: submit the form once and click the activation link FormSubmit
 * emails to CONTACT_EMAIL. Messages arrive after that.
 */

/** Where form messages are delivered. */
const CONTACT_EMAIL = "spr7498@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

function initContactForm() {
  const form = $(".contact__form");
  const errorEl = $(".contact__err");
  const button = $(".btn");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    const missing = findMissingField(data);
    if (missing) {
      errorEl.hidden = false;
      errorEl.textContent = `Add ${missing} so Pradeep can reply.`;
      return;
    }
    errorEl.hidden = true;
    button.textContent = "Sending…";

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message,
        _subject: `Project enquiry from ${data.name}`,
        _template: "table",
        _captcha: "false",
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (String(result.success) !== "true")
          throw new Error("FormSubmit did not accept the message");
        form.reset();
        button.textContent = "Message sent";
      })
      .catch(() => {
        errorEl.hidden = false;
        errorEl.textContent = `Message not sent. Please email ${CONTACT_EMAIL} directly.`;
        button.textContent = "Send message";
      });
  });
}

/** Returns what the visitor still needs to fill in, or "" when the form is complete. */
function findMissingField({ name, email, message }) {
  if (!name.trim()) return "your name";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "a valid email";
  if (!message.trim()) return "a short message";
  return "";
}
