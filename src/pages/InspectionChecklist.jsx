import { useState } from 'react';
import { inspectionItems } from '../data/mockData';

const options = ['Pass', 'Fail', 'NA'];

const InspectionChecklist = () => {
  const [responses, setResponses] = useState(
    inspectionItems.reduce((acc, item) => {
      acc[item.id] = { status: 'Pass', comment: '' };
      return acc;
    }, {})
  );

  const handleStatusChange = (id, status) => {
    setResponses({ ...responses, [id]: { ...responses[id], status } });
  };

  const handleCommentChange = (id, value) => {
    setResponses({ ...responses, [id]: { ...responses[id], comment: value } });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-[#20355f] bg-[#0f234d]/90 p-6">
        <h2 className="text-2xl font-semibold">Inspection Checklist</h2>
        <p className="mt-2 text-slate-400">Mark each item and add notes for safety review.</p>
      </div>

      <div className="rounded-[32px] border border-[#20355f] bg-[#11254d]/90 p-6">
        <div className="grid gap-6">
          {inspectionItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-[#20355f] bg-[#0f234d] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-400">Add inspection outcome and optional comment.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => handleStatusChange(item.id, option)}
                      className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                        responses[item.id].status === option
                          ? 'bg-gijima-red text-white'
                          : 'bg-[#122856] text-slate-300 hover:bg-[#163560]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <textarea
                  value={responses[item.id].comment}
                  onChange={(e) => handleCommentChange(item.id, e.target.value)}
                  placeholder="Add notes or observations..."
                  className="min-h-[100px] w-full px-4 py-3"
                />
              </div>
            </div>
          ))}
        </div>

        <button className="mt-6 rounded-3xl bg-gijima-red px-6 py-3 text-base text-white transition hover:bg-[#a83229]">
          Save checklist
        </button>
      </div>
    </div>
  );
};

export default InspectionChecklist;
