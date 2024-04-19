import { html } from "@lit-html/lit-html.js";
import { getSessionData, removeSessionData } from "@src/util.js";
import { navigationTemplate } from "@src/views/navigation.js";
import { previewAnswer } from "@src/views/partials.js";

/**
 *
 * @param {import("@src/types").PageContext} ctx
 * @returns {import("@lit-html/lit-html.js").TemplateResult}
 */
function resultTemplate(ctx, quiz, questions, correct, percentage) {
  return html` ${navigationTemplate(ctx)}
    <section id="summary">
      <div class="hero layout">
        <article class="details glass">
          <h1>Quiz Results</h1>
          <h2>${quiz.title}</h2>

          <div class="summary summary-top">${percentage}%</div>

          <div class="summary">${correct}/${questions.length} correct answers</div>

          <a class="action cta" href="/contest/${quiz.objectId}/1"><i class="fas fa-sync-alt"></i> Retake Quiz</a>
        </article>
      </div>

      <div class="pad-large alt-page">${questions.map((question, i) => previewAnswer(i, question, showMore))}</div>
    </section>`;
}

/**
 *
 * @param {import("@src/types").PageContext} ctx
 */
export function showResults(ctx) {
  const quiz = getSessionData("quiz");
  const questions = getSessionData("questions");
  const answers = getSessionData("answers");
  if (questions == null || quiz == null) {
    clearStorage();
    return ctx.page.redirect("/dashboard");
  }

  questions.forEach((question, i) => {
    question.isCorrect = question.correctIndex == answers[i + 1];
    question.answered = answers[i + 1];
  });

  const correct = questions.filter(q => q.isCorrect == true).length;
  const percentage = Math.floor((correct / questions.length) * 100)
  ctx.render(resultTemplate(ctx, quiz, questions, correct, percentage));
}

function clearStorage() {
  removeSessionData("quiz");
  removeSessionData("questions");
  removeSessionData("answers");
}

function showMore(e) {
    const btn = e.currentTarget;
    const art = btn.parentElement.parentElement;
    const btnText = art.querySelector(".s-incorrect") ? "Reveal answer" : "See question"
    const hiddenContent = art.querySelector("#hiddenContent");
    
    hiddenContent.style.display = hiddenContent.style.display == "none" ? "block" : "none";
    btn.textContent = btn.textContent == btnText ? "Close" : btnText;
}