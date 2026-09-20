/* eslint-disable @typescript-eslint/no-magic-numbers -- Static SVG pixel coordinates; gameplay values come from selectors. */
import type { CareerState } from "../types";
import { crewCount } from "../game/career/selectors";
import { activeSpecialists } from "../game/career/studioSelectors";

const DESKS = [
  [145, 270],
  [335, 270],
  [525, 270],
  [175, 365],
  [365, 365],
  [555, 365],
] as const;
const CREW_PER_DESK = 5;
const SERVER_ROWS = [0, 1, 2, 3, 4];
function Desk({ x, y, working }: { x: number; y: number; working: boolean }) {
  return (
    <g
      transform={`translate(${String(x)} ${String(y)})`}
      className={working ? "desk-working" : ""}
    >
      <ellipse cx="0" cy="41" rx="65" ry="17" fill="#09121c" opacity=".35" />
      <path d="M-57 1v35M54 1v35" stroke="#516776" strokeWidth="6" />
      <path d="M-66 -16h118l20 25H-48z" fill="#587982" stroke="#8aadb0" />
      <path d="M-48 9H72v7H-48z" fill="#344f5c" />
      <path d="M-16 -20v17" stroke="#66878d" strokeWidth="5" />
      <rect
        x="-43"
        y="-58"
        width="62"
        height="39"
        rx="4"
        fill="#172c3c"
        stroke="#708f98"
        strokeWidth="3"
      />
      <path
        className="screen-lines"
        d="M-35 -48h29M-35 -40h44M-35 -32h21"
        stroke={working ? "#8be2bb" : "#3b5367"}
        strokeWidth="3"
      />
      <path d="M-31 -6h43l7 8h-44z" fill="#1b3343" />
      <rect x="40" y="-15" width="12" height="14" rx="3" fill="#d9ba8f" />
      {working && (
        <g className="office-person">
          <rect x="-6" y="16" width="35" height="40" rx="12" fill="#304456" />
          <path d="M-8 35q22-31 44 0v13H-8z" fill="#74abac" />
          <circle cx="14" cy="15" r="13" fill="#d3ae91" />
          <path d="M1 12q0-22 26-7l1 10-9-10-18 10z" fill="#263b49" />
        </g>
      )}
    </g>
  );
}
export function OfficeScene({ game: s, level }: { game: CareerState; level: number }) {
  const desks = Math.min(
    DESKS.length,
    Math.max(1, Math.ceil(crewCount(s) / CREW_PER_DESK)),
  );
  const staff = activeSpecialists(s);
  const servers = s.crew.runner + s.crew.cloud + s.crew.ai + s.crew.orbital;
  return (
    <svg
      className={`office-scene office-level-${String(level)}`}
      viewBox="0 0 920 490"
      role="img"
      aria-label={`Офіс: ${String(crewCount(s))} одиниць команди, ${String(staff.length)} активних фахівців`}
    >
      <defs>
        <linearGradient id="officeSky" x2="0" y2="1">
          <stop stopColor="#183850" />
          <stop offset="1" stopColor="#437078" />
        </linearGradient>
        <linearGradient id="officeFloor" x2="1" y2="1">
          <stop stopColor="#203443" />
          <stop offset="1" stopColor="#101c29" />
        </linearGradient>
        <pattern id="officeTiles" width="46" height="46" patternUnits="userSpaceOnUse">
          <path d="M46 0H0v46" fill="none" stroke="#b2d9da" strokeOpacity=".035" />
        </pattern>
      </defs>
      <ellipse cx="460" cy="452" rx="411" ry="24" fill="#080f19" opacity=".6" />
      <path
        d="M43 224h830v211l-22 22H65l-22-22z"
        fill="url(#officeFloor)"
        stroke="#385060"
      />
      <path d="M43 224h830v211l-22 22H65l-22-22z" fill="url(#officeTiles)" />
      <path
        className="office-backwall"
        d="M43 71h830v153H43z"
        fill="#273d4d"
        stroke="#526773"
      />
      <path d="M43 71l-15 20v347l15-3z" fill="#344c59" />
      <path d="M873 71l16 20v347l-16-3z" fill="#172c3b" />
      {[100, 270].map((x) => (
        <g key={x}>
          <rect
            x={x}
            y="94"
            width="139"
            height="105"
            rx="5"
            fill="url(#officeSky)"
            stroke="#708995"
            strokeWidth="5"
          />
          <path
            d={`M${String(x + 12)} 187v-28h28v-24h24v42h30v-62h24v72`}
            fill="#122b3d"
          />
          <path
            d={`M${String(x + 69)} 95v102M${String(x)} 144h139`}
            stroke="#729198"
            strokeWidth="4"
          />
        </g>
      ))}
      <rect
        x="445"
        y="101"
        width="198"
        height="96"
        rx="6"
        fill="#152b39"
        stroke="#68828c"
        strokeWidth="3"
      />
      <text x="462" y="125" fill="#a4c7c6" fontSize="12" letterSpacing="3">
        QA / CONTROL ROOM
      </text>
      <path
        d="M463 154h31l12-13 14 31 17-20h37l13-13 11 15h27"
        stroke="#8be2bb"
        strokeWidth="3"
        fill="none"
        className={crewCount(s) > 0 ? "office-signal" : ""}
      />
      <text x="462" y="184" fill="#708d9c" fontSize="10">
        {s.project ? "RELEASE IN PROGRESS" : "ALL SYSTEMS READY"}
      </text>
      <g transform="translate(720 160)">
        <rect
          width="91"
          height="190"
          rx="9"
          fill="#0b1b29"
          stroke="#4b677b"
          strokeWidth="3"
        />
        {SERVER_ROWS.map((i) => (
          <g key={i} transform={`translate(8 ${String(11 + i * 33)})`}>
            <rect width="75" height="26" rx="4" fill="#263d4e" />
            <path d="M8 9h35M8 15h35" stroke="#506777" strokeWidth="2" />
            <circle
              className={servers > 0 ? "server-led" : ""}
              cx="61"
              cy="13"
              r="3"
              fill={servers > 0 ? "#8be2bb" : "#4a5868"}
            />
          </g>
        ))}
        <text x="45" y="182" textAnchor="middle" fill="#74939f" fontSize="8">
          {s.crew.orbital ? "ORBITAL LINK" : s.crew.ai ? "AI CLUSTER" : "QA INFRA"}
        </text>
      </g>
      {DESKS.slice(0, desks).map(([x, y], i) => (
        <Desk key={i} x={x} y={y} working={crewCount(s) > 0} />
      ))}
      <g transform="translate(796 390)">
        <ellipse rx="23" ry="9" fill="#091924" />
        <path d="M-15-33h30l-5 32h-20z" fill="#b29d83" />
        <path
          d="M0-32v-58M0-54q-33-32-28-5Q-25-40 0-42M0-69q36-26 27-3Q18-53 0-55M0-78q-17-32-13-11Q-7-69 0-64"
          fill="#5c9e8a"
          stroke="#6ab29a"
          strokeWidth="3"
        />
      </g>
      {level > 0 && (
        <g transform="translate(695 102)">
          <rect width="131" height="34" rx="6" fill="#1b303d" stroke="#57717b" />
          <text
            x="66"
            y="22"
            textAnchor="middle"
            fill="#d6be85"
            fontSize="13"
            letterSpacing="3"
          >
            {["", "TEAM", "LAB", "CAMPUS", "HQ"][level]}
          </text>
        </g>
      )}
      {s.crew.lab > 0 && (
        <g transform="translate(644 373)">
          <path d="M-9 25h101v10H-9z" fill="#5c7984" />
          {[0, 30, 60].map((x) => (
            <g key={x} transform={`translate(${String(x)} 0)`}>
              <rect width="22" height="29" rx="3" fill="#122c40" stroke="#90a8b1" />
              <path d="M5 9h12M5 15h8" stroke="#c7a7ee" />
            </g>
          ))}
        </g>
      )}
      {level >= 3 && (
        <g transform="translate(831 54)" stroke="#83aabc" fill="none">
          <path
            d="M0 18V-22M-14 18h28M-20-20q20-21 40 0M-11-14q11-12 22 0"
            strokeWidth="3"
          />
          <circle cy="-7" r="4" fill="#8be2bb" />
        </g>
      )}
      {level === 4 && (
        <g transform="translate(669 171)" stroke="#edc482" strokeWidth="3" fill="none">
          <path d="M-9-27h18v14q0 15-9 15t-9-15zM0 2v12M-10 14h20M-9-23h-9q0 21 11 15M9-23h9q0 21-11 15" />
        </g>
      )}
      {staff.map((person, i) => (
        <g key={person.id} transform={`translate(${String(135 + i * 72)} 426)`}>
          <circle r="19" fill="#2e4352" stroke="#8be2bb" />
          <text y="5" textAnchor="middle" fill="#bde4d4" fontSize="14">
            {person.initials}
          </text>
        </g>
      ))}
    </svg>
  );
}
