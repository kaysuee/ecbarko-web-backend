let latestCardData = null;

export function updateCardData(data) {
  latestCardData = data;
}

export function removeCardData() {
  console.log("remove here");
  latestCardData = null;
}

export function getLatestCardData() {
  return latestCardData;
}
