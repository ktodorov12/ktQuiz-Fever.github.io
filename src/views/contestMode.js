import { html } from "@lit-html/lit-html.js";
import { getAllItemsForOneQuiz, getDataDetails } from "@src/data/data.js";
import { navigationTemplate } from "@src/views/navigation.js";
import { contestNavQuestionIndexAnchor, contestQuestion } from "@src/views/partials.js";

const quizCache = {};

/**
 * 
 * @param {import("@src/types").PageContext} ctx 
 * @returns {import("@lit-html/lit-html.js").TemplateResult}
 */
function contestTemplate(ctx, num, quiz, questions) {
  return html`
  ${navigationTemplate(ctx)}
  <section id="quiz">
    <header class="pad-large">
      <h1>${quiz.title}: Question ${num} / ${questions.length}</h1>
      <nav class="layout q-control">
        <span class="block">Question index</span>
        ${questions.map(contestNavQuestionIndexAnchor)}
      </nav>
    </header>
    <div class="pad-large alt-page">
      <article class="question">
        ${contestQuestion(questions[num - 1], num)}

        <nav class="q-control">
          <span class="block">12 questions remaining</span>
          <a class="action" href="/contest/${quiz.objectId}/${arithmetics["-"](num)}"><i class="fas fa-arrow-left"></i> Previous</a>
          <a class="action" href="#"><i class="fas fa-sync-alt"></i> Start over</a>
          <div class="right-col">
            <a class="action" href="/contest/${quiz.objectId}/${arithmetics["+"](num, questions.length)}">Next <i class="fas fa-arrow-right"></i></a>
            <a class="action" href="#">Submit answers</a>
          </div>
        </nav>
      </article>
    </div>
  </section>`;
}

/**
 * 
 * @param {import("@src/types").PageContext} ctx 
 */
export async function showContest(ctx) {
    // @ts-ignore
    let {id, num} = ctx.params;
    num = Number(num);

    //Check if the quiz data is already cached
    let quiz;
    if (quizCache[id]) {
        quiz = quizCache[id];
    } else {
        //Fetch quiz data if not found in the cache
        const data = await getDataDetails("quizzes", id);
        quiz = data.results[0];
        //Cache the fetched quiz data
        quizCache[id] = quiz;
    }

    // Fetch questions for the quiz
    let questions;
    if (quizCache[id + '_questions']) {
        questions = quizCache[id + '_questions'];
    } else {
        questions = await getAllItemsForOneQuiz("questions", quiz.objectId);
        quizCache[id + '_questions'] = questions;
    }

    const solutions = await getAllItemsForOneQuiz("solutions", quiz.objectId);
    // Render the contest template with the fetched data
    ctx.render(contestTemplate(ctx, num, quiz, questions.results));
}

const arithmetics = {
    "-": (num) => num - 1 < 1 ? 1 : num - 1,
    "+": (num, max) => num + 1 > max ? max : num + 1
}