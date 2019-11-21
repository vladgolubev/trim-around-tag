interface TrimTextAroundTagParams {
  text?: string;
  maxLengthAround?: number;
  maxTotalLength?: number;
  tag?: string;
  omission?: string;
}

export function trimTextAroundTag({
  text = '',
  maxLengthAround = 200,
  maxTotalLength = 500,
  tag = 'em',
  omission = ''
}: TrimTextAroundTagParams): string {
  const OPEN_TAG = `<${tag}>`;

  if (isTextTooSmallToTrim(text, maxTotalLength)) {
    return text;
  }

  if (isTextWithoutHighlights({text, OPEN_TAG})) {
    return text;
  }

  const textParts = text.split(new RegExp(`</?${tag}>`));
  const textTrimmed = textParts
    .map((textPart, i) => {
      const isEvenTextPart = i % 2 === 0;
      const isLastTextPart = i === textParts.length - 1;

      if (isLastTextPart) {
        return trimTextUntilSizeFromEnd(textPart, maxLengthAround, omission);
      }

      if (isEvenTextPart) {
        return `${trimTextUntilSize(textPart, maxLengthAround, omission)}<em>`;
      }

      return `${trimTextUntilSizeFromEnd(textPart, maxLengthAround, omission)}</em>`;
    })
    .join('');

  if (textTrimmed.length > maxTotalLength) {
    return textTrimmed.slice(0, maxTotalLength).trim() + omission;
  }

  return textTrimmed.trim();
}

function isTextTooSmallToTrim(text: string, maxLengthAround: number): boolean {
  return text.length <= maxLengthAround;
}

function isTextWithoutHighlights({text, OPEN_TAG}: {text: string; OPEN_TAG: string}): boolean {
  const firstHighlightStartIndex = text.indexOf(OPEN_TAG);

  return firstHighlightStartIndex === -1;
}

function trimTextUntilSize(text: string, maxLengthAround: number, omission: string): string {
  const wordsInput = text.split(' ').reverse();
  const firstWord = wordsInput[0];

  if (firstWord.length > maxLengthAround) {
    const croppedWord = [...firstWord]
      .reverse()
      .slice(0, maxLengthAround)
      .reverse()
      .join('');

    return `${omission}${croppedWord}`;
  }

  const wordsOutput = getWordsUntilLength(wordsInput, maxLengthAround);

  if (wordsInput.length > wordsOutput.length) {
    return `${omission}${wordsOutput.reverse().join(' ')}`;
  }

  return wordsOutput.reverse().join(' ');
}

function trimTextUntilSizeFromEnd(text: string, maxLengthAround: number, omission: string): string {
  const wordsInput = text.split(' ');
  const firstWord = wordsInput[0];

  if (firstWord.length > maxLengthAround) {
    const croppedWord = firstWord.slice(0, maxLengthAround);

    return `${croppedWord}${omission}`;
  }

  const wordsOutput = getWordsUntilLength(wordsInput, maxLengthAround);

  if (wordsInput.length > wordsOutput.length) {
    return `${wordsOutput.join(' ')}${omission}`;
  }

  return wordsOutput.join(' ');
}

function getWordsUntilLength(words: string[], maxLength: number): string[] {
  const wordsOutput = [];
  let outputLength = 0;

  for (const word of words) {
    const willTextBecomeTooLong = outputLength + word.length + 1 > maxLength;

    if (willTextBecomeTooLong) {
      return wordsOutput;
    }

    const isTextStillShort = outputLength <= maxLength;

    if (isTextStillShort) {
      wordsOutput.push(word);
      outputLength += word.length + 1;
    }
  }

  return wordsOutput;
}
