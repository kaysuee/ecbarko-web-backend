let latestCardData = null;

// export function updateCardData(data) {
//   latestCardData = data;
// }

export function removeCardData() {
  console.log("remove here");
  latestCardData = null;
}

// export function getLatestCardData() {
//   return latestCardData;
// }

export function updateCardData(data) {
  latestCardData = {
    ...data,
    scannedAt: Date.now(), // use timestamp for comparison
  };
}

export function getLatestCardData() {
  const MAX_AGE = 1000; // 1 second
  if (
    latestCardData &&
    Date.now() - latestCardData.scannedAt < MAX_AGE
  ) {
    return latestCardData;
  }
  return null; // consider card removed
}

