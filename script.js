(function () {
  "use strict";

  // ---------- helpers ----------

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a || 1;
  }

  function reduceFraction(num, den) {
    if (den < 0) {
      num = -num;
      den = -den;
    }
    const g = gcd(num, den);
    return [num / g, den / g];
  }

  function fractionText(num, den) {
    return den === 1 ? `${num}` : `${num}/${den}`;
  }

  function randomDecimal(min, max, places) {
    const factor = Math.pow(10, places);
    const value = randInt(min * factor, max * factor) / factor;
    return value;
  }

  function fmt(n, places) {
    return n.toFixed(places);
  }

  // ---------- difficulty ranges ----------

  const RANGES = {
    addition: {
      easy: [1, 20],
      medium: [10, 100],
      hard: [100, 999],
    },
    subtraction: {
      easy: [1, 20],
      medium: [10, 100],
      hard: [100, 999],
    },
    multiplication: {
      easy: { a: [1, 10], b: [1, 10] },
      medium: { a: [10, 99], b: [1, 12] },
      hard: { a: [10, 99], b: [10, 99] },
    },
    division: {
      easy: { divisor: [1, 10], quotient: [1, 10] },
      medium: { divisor: [2, 12], quotient: [2, 20] },
      hard: { divisor: [2, 25], quotient: [2, 50] },
    },
    fractions: {
      easy: { den: [2, 10] },
      medium: { den: [2, 12] },
      hard: { den: [2, 20] },
    },
    decimals: {
      easy: { range: [0.1, 9.9], mulRange: [0.1, 9.9], divisor: [2, 5], places: 1 },
      medium: { range: [1, 99.99], mulRange: [0.1, 9.9], divisor: [2, 10], places: 2 },
      hard: { range: [10, 999.99], mulRange: [1, 99.99], divisor: [2, 12], places: 2 },
    },
  };

  // ---------- problem generators ----------

  function genAddition(difficulty) {
    const [lo, hi] = RANGES.addition[difficulty];
    const a = randInt(lo, hi);
    const b = randInt(lo, hi);
    return { expr: `${a} + ${b} = `, answer: `${a + b}` };
  }

  function genSubtraction(difficulty) {
    const [lo, hi] = RANGES.subtraction[difficulty];
    let a = randInt(lo, hi);
    let b = randInt(lo, hi);
    if (b > a) [a, b] = [b, a];
    return { expr: `${a} - ${b} = `, answer: `${a - b}` };
  }

  function genMultiplication(difficulty) {
    const { a: ra, b: rb } = RANGES.multiplication[difficulty];
    const a = randInt(ra[0], ra[1]);
    const b = randInt(rb[0], rb[1]);
    return { expr: `${a} × ${b} = `, answer: `${a * b}` };
  }

  function genDivision(difficulty) {
    const { divisor: rd, quotient: rq } = RANGES.division[difficulty];
    const divisor = randInt(rd[0], rd[1]);
    const quotient = randInt(rq[0], rq[1]);
    const dividend = divisor * quotient;
    return { expr: `${dividend} ÷ ${divisor} = `, answer: `${quotient}` };
  }

  function genMixed(difficulty) {
    const ops = [genAddition, genSubtraction, genMultiplication, genDivision];
    const pick = ops[randInt(0, ops.length - 1)];
    return pick(difficulty);
  }

  function genFraction(difficulty) {
    const { den: denRange } = RANGES.fractions[difficulty];
    const types =
      difficulty === "easy"
        ? ["add_like", "sub_like", "simplify"]
        : ["add", "sub", "multiply", "divide", "simplify"];
    const type = types[randInt(0, types.length - 1)];

    function randFrac() {
      const d = randInt(denRange[0], denRange[1]);
      const n = randInt(1, d - 1 === 0 ? 1 : d - 1);
      return [n, d];
    }

    if (type === "simplify") {
      const [rn, rd] = randFrac();
      const factor = randInt(2, 5);
      const num = rn * factor;
      const den = rd * factor;
      const [an, ad] = reduceFraction(num, den);
      return {
        expr: `Simplify: ${fractionText(num, den)} = `,
        answer: fractionText(an, ad),
      };
    }

    if (type === "add_like" || type === "sub_like") {
      const d = randInt(denRange[0], denRange[1]);
      let n1 = randInt(1, d - 1);
      let n2 = randInt(1, d - 1);
      if (type === "sub_like" && n2 > n1) [n1, n2] = [n2, n1];
      const opSym = type === "add_like" ? "+" : "-";
      const resultNum = type === "add_like" ? n1 + n2 : n1 - n2;
      const [an, ad] = reduceFraction(resultNum, d);
      return {
        expr: `${fractionText(n1, d)} ${opSym} ${fractionText(n2, d)} = `,
        answer: fractionText(an, ad),
      };
    }

    let [n1, d1] = randFrac();
    let [n2, d2] = randFrac();

    if (type === "add" || type === "sub") {
      let num1 = n1 * d2;
      let num2 = n2 * d1;
      const den = d1 * d2;
      if (type === "sub" && num2 > num1) {
        [num1, num2] = [num2, num1];
        [n1, n2] = [n2, n1];
      }
      const opSym = type === "add" ? "+" : "-";
      const resultNum = type === "add" ? num1 + num2 : num1 - num2;
      const [an, ad] = reduceFraction(resultNum, den);
      return {
        expr: `${fractionText(n1, d1)} ${opSym} ${fractionText(n2, d2)} = `,
        answer: fractionText(an, ad),
      };
    }

    if (type === "multiply") {
      const [an, ad] = reduceFraction(n1 * n2, d1 * d2);
      return {
        expr: `${fractionText(n1, d1)} × ${fractionText(n2, d2)} = `,
        answer: fractionText(an, ad),
      };
    }

    // divide
    const [an, ad] = reduceFraction(n1 * d2, d1 * n2);
    return {
      expr: `${fractionText(n1, d1)} ÷ ${fractionText(n2, d2)} = `,
      answer: fractionText(an, ad),
    };
  }

  function genDecimal(difficulty) {
    const { range, mulRange, divisor: divisorRange, places } = RANGES.decimals[difficulty];
    const ops =
      difficulty === "easy" ? ["+", "-"] : ["+", "-", "×", "÷"];
    const op = ops[randInt(0, ops.length - 1)];

    if (op === "÷") {
      const divisor = randInt(divisorRange[0], divisorRange[1]);
      const quotient = randomDecimal(range[0], range[1] / divisor, places);
      const dividend = Math.round(quotient * divisor * Math.pow(10, places)) / Math.pow(10, places);
      return {
        expr: `${fmt(dividend, places)} ÷ ${divisor} = `,
        answer: fmt(quotient, places),
      };
    }

    if (op === "×") {
      const a = randomDecimal(mulRange[0], mulRange[1], places);
      const b = randomDecimal(mulRange[0], mulRange[1], places);
      const result = Math.round(a * b * Math.pow(10, places)) / Math.pow(10, places);
      return {
        expr: `${fmt(a, places)} × ${fmt(b, places)} = `,
        answer: fmt(result, places),
      };
    }

    let a = randomDecimal(range[0], range[1], places);
    let b = randomDecimal(range[0], range[1], places);

    if (op === "-" && b > a) [a, b] = [b, a];

    const result = op === "+" ? a + b : a - b;

    return {
      expr: `${fmt(a, places)} ${op} ${fmt(b, places)} = `,
      answer: fmt(Math.round(result * Math.pow(10, places)) / Math.pow(10, places), places),
    };
  }

  const GENERATORS = {
    addition: genAddition,
    subtraction: genSubtraction,
    multiplication: genMultiplication,
    division: genDivision,
    mixed: genMixed,
    fractions: genFraction,
    decimals: genDecimal,
  };

  // ---------- rendering ----------

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function generateWorksheet() {
    const title = document.getElementById("worksheetTitle").value.trim() || "Math Practice";
    const topic = document.getElementById("topic").value;
    const difficulty = document.getElementById("difficulty").value;
    const numProblems = Math.min(
      60,
      Math.max(4, parseInt(document.getElementById("numProblems").value, 10) || 20)
    );
    const columns = document.getElementById("columns").value;
    const includeHeader = document.getElementById("includeHeader").checked;
    const includeAnswerKey = document.getElementById("includeAnswerKey").checked;

    const generator = GENERATORS[topic];
    const problems = [];
    for (let i = 0; i < numProblems; i++) {
      problems.push(generator(difficulty));
    }

    const container = document.getElementById("worksheet");
    container.innerHTML = "";

    if (includeHeader) {
      const header = document.createElement("div");
      header.className = "worksheet-header";
      header.innerHTML = `
        <h2>${escapeHtml(title)}</h2>
        <div class="name-date">
          <span>Name: <span></span></span>
          <span>Date: <span></span></span>
        </div>
      `;
      container.appendChild(header);
    } else {
      const heading = document.createElement("h2");
      heading.textContent = title;
      heading.style.marginTop = "0";
      container.appendChild(heading);
    }

    const grid = document.createElement("div");
    grid.className = `problem-grid cols-${columns}`;
    problems.forEach((p, i) => {
      const item = document.createElement("div");
      item.className = "problem";
      item.innerHTML = `<span class="num">${i + 1}.</span><span class="expr">${escapeHtml(p.expr)}</span>`;
      grid.appendChild(item);
    });
    container.appendChild(grid);

    if (includeAnswerKey) {
      const key = document.createElement("div");
      key.className = "answer-key";
      const keyGrid = document.createElement("div");
      keyGrid.className = "answer-grid";
      problems.forEach((p, i) => {
        const item = document.createElement("div");
        item.innerHTML = `<span class="num">${i + 1}.</span>${escapeHtml(p.answer)}`;
        keyGrid.appendChild(item);
      });
      key.innerHTML = `<h2>Answer Key — ${escapeHtml(title)}</h2>`;
      key.appendChild(keyGrid);
      container.appendChild(key);
    }
  }

  document.getElementById("generateBtn").addEventListener("click", generateWorksheet);
  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  // generate an initial worksheet on load
  generateWorksheet();
})();
