import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';

const DebugInfo = ({ debugInfo }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  if (!debugInfo || debugInfo.length === 0) return null;

  return (
    <div className="mt-6">
      <div
        className="cursor-pointer text-muted-foreground text-sm border-t border-border pt-2 mt-4 select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="mr-2">{expanded ? '▼' : '▶'}</span>
        Debug Info
      </div>
      {expanded && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDialog(true)}
            className="mb-2"
          >
            Show API Call Details
          </Button>
          {showDialog && (
            <div
              className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
              onClick={() => setShowDialog(false)}
            >
              <Card
                className="min-w-[350px] max-w-[600px] max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <CardHeader>
                  <CardTitle>API Call Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-5 space-y-3">
                    {debugInfo.map((chunk, idx) => (
                      <li key={idx} className="space-y-1">
                        <div className="font-semibold">Chunk {idx + 1}</div>
                        {chunk.target && <div>Target: <code className="bg-muted px-1 rounded">{chunk.target}</code></div>}
                        {chunk.targets && <div>Targets: <code className="bg-muted px-1 rounded">{Array.isArray(chunk.targets) ? chunk.targets.join(', ') : chunk.targets}</code></div>}
                        <div>Start: <code className="bg-muted px-1 rounded">{chunk.start?.toLocaleString?.('en-IN', { timeZone: 'Asia/Kolkata' }) || String(chunk.start)}</code></div>
                        <div>End: <code className="bg-muted px-1 rounded">{chunk.end?.toLocaleString?.('en-IN', { timeZone: 'Asia/Kolkata' }) || String(chunk.end)}</code></div>
                        <div>Message: <code className="bg-muted px-1 rounded">{chunk.message}</code></div>
                      </li>
                    ))}
                  </ol>
                  <Button
                    onClick={() => setShowDialog(false)}
                    className="mt-4"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugInfo; 