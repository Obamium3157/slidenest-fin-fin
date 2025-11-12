export function parseFontSize(fontSize: string | undefined): {
  value: number;
  unit: string;
} {
  if (!fontSize) {
    return { value: 14, unit: "px" };
  }

  const str = fontSize.trim();
  if (str.length === 0) {
    return { value: 14, unit: "px" };
  }

  let i = 0;
  let hasDot = false;
  let numberPart = "";

  if (str[i] === "-" || str[i] === "+") {
    numberPart += str[i];
    i++;
  }

  for (; i < str.length; i++) {
    const ch = str[i];
    if (ch >= "0" && ch <= "9") {
      numberPart += ch;
    } else if (ch === "." && !hasDot) {
      hasDot = true;
      numberPart += ch;
    } else {
      break;
    }
  }

  const rest = str.slice(i).trim();
  const num = Number(numberPart);
  if (Number.isNaN(num)) {
    return { value: 14, unit: "px" };
  }

  const unit = rest.length > 0 ? rest : "px";
  return { value: num, unit };
}
