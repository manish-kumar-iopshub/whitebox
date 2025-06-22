// Test the day-based chunking logic
const createDayBasedChunks = (startTime, endTime) => {
  const chunks = [];
  const startDate = new Date(startTime * 1000);
  const endDate = new Date(endTime * 1000);
  
  // If duration is less than 24 hours, return single chunk
  const durationHours = (endTime - startTime) / 3600;
  if (durationHours <= 24) {
    return [{ start: startTime, end: endTime }];
  }
  
  let currentStart = startTime;
  
  while (currentStart < endTime) {
    // Calculate the end of the current day (00:00:00 of next day)
    const currentDate = new Date(currentStart * 1000);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    
    const dayEnd = Math.floor(nextDay.getTime() / 1000);
    const chunkEnd = Math.min(dayEnd, endTime);
    
    chunks.push({ start: currentStart, end: chunkEnd });
    
    // Move to next day
    currentStart = chunkEnd;
  }
  
  return chunks;
};

// Test with the user's example: 4 Jun 2025 1:12 PM to 23 Jun 2025 3:21 AM
const startDate = new Date('2025-06-04T13:12:00');
const endDate = new Date('2025-06-23T03:21:00');

const startTime = Math.floor(startDate.getTime() / 1000);
const endTime = Math.floor(endDate.getTime() / 1000);

console.log('Test chunking logic:');
console.log(`Start: ${startDate.toISOString()}`);
console.log(`End: ${endDate.toISOString()}`);
console.log(`Duration: ${(endTime - startTime) / 3600} hours`);

const chunks = createDayBasedChunks(startTime, endTime);

console.log(`\nCreated ${chunks.length} chunks:`);
chunks.forEach((chunk, index) => {
  const chunkStart = new Date(chunk.start * 1000);
  const chunkEnd = new Date(chunk.end * 1000);
  console.log(`Chunk ${index + 1}: ${chunkStart.toISOString()} to ${chunkEnd.toISOString()}`);
  console.log(`  Duration: ${(chunk.end - chunk.start) / 3600} hours`);
});

// Verify the chunks cover the entire range
const firstChunkStart = chunks[0].start;
const lastChunkEnd = chunks[chunks.length - 1].end;
console.log(`\nVerification:`);
console.log(`First chunk starts at: ${new Date(firstChunkStart * 1000).toISOString()}`);
console.log(`Last chunk ends at: ${new Date(lastChunkEnd * 1000).toISOString()}`);
console.log(`Coverage complete: ${firstChunkStart === startTime && lastChunkEnd === endTime}`); 