export interface QuizQuestion {
  num?: number;
  question: string;
  options: string[];
  answer?: string;
  explanation?: string;
  images?: string[];
  url?: string;
}

export const RE_BRACKET_URL = /\[(https?:\/\/[^\]]+)\]/g;
export const RE_QUESTION_START = /^\d+[\.\)]\s/;
export const RE_OPTION_LONE = /^[A-E][\.\)]?\s*$/;
export const RE_OPTION_STANDARD = /^[A-E][\.\)]?\s+\S/;
export const RE_ANSWER = /^Answer:\s*/i;
export const RE_EXPLANATION = /^Explanation:\s*/i;

export function extractUrlsFromText(text: string): string[] {
  const matches = [...text.matchAll(RE_BRACKET_URL)];
  return matches.map((m) => m[1].trim());
}

export function sanitizeUrl(url: string): string {
  if (!url) return "";
  return url.replace(/[\[\]]/g, "").trim();
}

/**
 * Splits raw DOCX text into logical lines where Word/Users might have merged them.
 */
export function virtualSplit(text: string): string {
  let s = text;
  // Split before option letters (A. B. etc)
  s = s.replace(/(\S)\s*([A-E][\.\)]\s+)/g, "$1\n$2");
  // Split before question numbers (1. 2. etc)
  s = s.replace(/([^,(=])\s*(\b\d+[\.\)]\s+)/g, "$1\n$2");
  // Split before Answer:/Explanation:
  s = s.replace(/(\S)\s*(Answer:\s*)/gi, "$1\n$2");
  s = s.replace(/(\S)\s*(Explanation:\s*)/gi, "$1\n$2");
  // Split before no-dot option letters (Case: D bringing -> D\nbringing)
  s = s.replace(/([a-z,\\.!\?])\s+([A-E]\s+[A-Z])/g, "$1\n$2");
  return s;
}

/**
 * Parses normalized text into an array of QuizQuestion objects.
 */
export function parseQuizText(text: string): QuizQuestion[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const questions: QuizQuestion[] = [];
  let current: QuizQuestion | null = null;
  let options: string[] = [];

  for (let line of lines) {
    if (RE_QUESTION_START.test(line)) {
      // New question starts
      if (current) {
        current.options = options;
        questions.push(current);
      }
      
      const numMatch = line.match(/^(\d+)[\.\)]/);
      const num = numMatch ? parseInt(numMatch[1]) : undefined;
      
      current = {
        num,
        question: line.replace(RE_QUESTION_START, "").trim(),
        options: [],
        images: [],
      };
      options = [];

      const urls = extractUrlsFromText(line);
      if (urls.length > 0) {
        current.images = urls.map(u => sanitizeUrl(u));
        current.url = current.images[0];
        // Remove bracketed URLs from the visible question text
        current.question = current.question.replace(RE_BRACKET_URL, "").trim();
      }
    } else if (RE_ANSWER.test(line)) {
      if (current) current.answer = line.replace(RE_ANSWER, "").replace(/<\/?(?:b|i|u)>/gi, "").trim();
    } else if (RE_EXPLANATION.test(line)) {
      if (current) current.explanation = line.replace(RE_EXPLANATION, "").trim();
    } else if (RE_OPTION_LONE.test(line)) {
      // Lone option letter (e.g. "D") — text is on the next line
      options.push("");
    } else if (RE_OPTION_STANDARD.test(line)) {
      options.push(line.replace(/^[A-E][\.\)]?\s+/, "").trim());
    } else if (current) {
      if (options.length === 0) {
        // Continuation of question text
        const urls = extractUrlsFromText(line);
        if (urls.length > 0) {
          if (!current.images) current.images = [];
          current.images.push(...urls.map(u => sanitizeUrl(u)));
          if (!current.url) current.url = current.images[0];
          line = line.replace(RE_BRACKET_URL, "").trim();
        }
        current.question = `${current.question} ${line}`.trim();
      } else {
        // Continuation of the last option (or filling in a lone-letter placeholder)
        if (options[options.length - 1] === "") {
          options[options.length - 1] = line.trim();
        } else {
          options[options.length - 1] += " " + line.trim();
        }
      }
    }
  }

  // Push final question
  if (current) {
    current.options = options;
    questions.push(current);
  }

  return questions;
}
