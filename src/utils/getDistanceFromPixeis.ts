import devicePxPerCm from "./devicePxPerCm";

const getCmText = (lengthInCm: number) => {
  return `${lengthInCm.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} cm`;
};
const getMeterText = (lengthInCm: number) => {
  return `${(lengthInCm / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m`;
};

export const getDistanceFromPixels = (pixelLength: number, scale: number) => {
  const cmLength = (pixelLength / devicePxPerCm()) * scale;
  return cmLength < 100 ? getCmText(cmLength) : getMeterText(cmLength);
};
