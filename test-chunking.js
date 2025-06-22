// Test the day-based chunking logic
const createDayBasedChunks = (startTime, endTime) => {
  const chunks = [];
  const startDate = new Date(startTime * 1000);
  const endDate = new Date(endTime * 1000);
  
  // Always create at least 2 chunks, splitting at day boundaries
  // Even for single day ranges, split at midnight
  
  let currentStart = startTime;
  let currentDate = new Date(startDate);
  
  while (currentStart < endTime) {
    // Calculate the end of the current day (00:00:00 of next day)
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    
    const dayEnd = Math.floor(nextDay.getTime() / 1000);
    const chunkEnd = Math.min(dayEnd, endTime);
    
    chunks.push({ start: currentStart, end: chunkEnd });
    
    // Move to next day
    currentStart = chunkEnd;
    currentDate = nextDay;
  }
  
  return chunks;
};

// Test with the user's example: 21/06 9:20 to 22/06 9:20 (single day)
const startDate = new Date('2025-06-21T09:20:59');
const endDate = new Date('2025-06-22T09:20:59');

const startTime = Math.floor(startDate.getTime() / 1000);
const endTime = Math.floor(endDate.getTime() / 1000);

console.log('Test chunking logic for single day:');
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
console.log(`Minimum 2 chunks: ${chunks.length >= 2}`);

// Test with a shorter time range (6 hours)
console.log('\n' + '='.repeat(50));
const shortStartDate = new Date('2025-06-21T10:00:00');
const shortEndDate = new Date('2025-06-21T16:00:00');

const shortStartTime = Math.floor(shortStartDate.getTime() / 1000);
const shortEndTime = Math.floor(shortEndDate.getTime() / 1000);

console.log('Test chunking logic for short range (6 hours):');
console.log(`Start: ${shortStartDate.toISOString()}`);
console.log(`End: ${shortEndDate.toISOString()}`);
console.log(`Duration: ${(shortEndTime - shortStartTime) / 3600} hours`);

const shortChunks = createDayBasedChunks(shortStartTime, shortEndTime);

console.log(`\nCreated ${shortChunks.length} chunks:`);
shortChunks.forEach((chunk, index) => {
  const chunkStart = new Date(chunk.start * 1000);
  const chunkEnd = new Date(chunk.end * 1000);
  console.log(`Chunk ${index + 1}: ${chunkStart.toISOString()} to ${chunkEnd.toISOString()}`);
  console.log(`  Duration: ${(chunk.end - chunk.start) / 3600} hours`);
});

console.log(`Minimum 2 chunks: ${shortChunks.length >= 2}`); 