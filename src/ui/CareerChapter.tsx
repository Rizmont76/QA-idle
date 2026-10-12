import type { CareerState } from "../types";
import type { CareerView } from "../game/career/discovery";
import { viewUnlocked } from "../game/career/discovery";
import { currentChapter, chapterRows, rankMultiplier } from "../game/career/chapters";
import { CAREER_STAGES } from "../game/career/content";
import { number } from "./careerUtils";
import { cash } from "./careerUtils";
import { chapterTool } from "../game/career/chapterActions";

export function CareerChapter({
  game: s,
  open,
}: {
  game: CareerState;
  open: (view: CareerView) => void;
}) {
  const chapter = currentChapter(s);
  const tool = chapterTool(s);
  return (
    <section className="panel career-chapter" aria-label="Цілі поточного рангу">
      <div className="chapter-intro">
        <div>
          <span className="eyebrow">
            {CAREER_STAGES[s.stage]?.title} · ТВОЯ ПОТОЧНА ГЛАВА
          </span>
          <h2>{chapter.title}</h2>
          <p>{chapter.brief}</p>
        </div>
        <div className="chapter-power">
          <strong>×{number(rankMultiplier(s))}</strong>
          <small>
            сила рангу
            <br />
            команда й ручні тести
          </small>
        </div>
      </div>
      <div className="chapter-goals">
        {chapterRows(s).map((row) => {
          const target = viewUnlocked(s, row.view) ? row.view : "projects";
          return (
            <button
              key={row.goal.kind}
              className={`chapter-goal ${row.done ? "done" : ""}`}
              onClick={() => {
                open(target);
                if (target === "workspace") {
                  window.requestAnimationFrame(() => {
                    document
                      .getElementById(
                        row.goal.kind === "crew"
                          ? "team"
                          : row.goal.kind === "upgrade"
                            ? "upgrades"
                            : "contracts",
                      )
                      ?.scrollIntoView({ block: "start" });
                  });
                }
              }}
              aria-label={`${row.title}: ${String(row.value)} з ${String(row.target)}`}
            >
              <span className="chapter-check">{row.done ? "✓" : "○"}</span>
              <span>
                {row.title}
                <small>
                  {number(row.value)} / {number(row.target)}
                  {row.done ? " · готово" : " · перейти →"}
                </small>
              </span>
            </button>
          );
        })}
      </div>
      {tool && (
        <p className="chapter-caption">
          Найближчий інструмент: {tool.title} · {cash(tool.cost)}
          {tool.insights > 0
            ? ` + ${number(tool.insights)} ◈. Залиш ці інсайти для запуску або зароби їх контрактами.`
            : ". Інсайти для першого запуску не потрібні."}
        </p>
      )}
      <p className="chapter-caption">
        {s.stage < CAREER_STAGES.length - 1
          ? "Цілі глави + дохід рангу + команда відкриють підвищення. Гроші можна витрачати."
          : "Додаткова мета. Престиж уже доступний."}
      </p>
    </section>
  );
}
