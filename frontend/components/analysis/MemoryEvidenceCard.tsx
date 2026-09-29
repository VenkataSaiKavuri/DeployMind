import type { Memory } from "@/lib/api";

interface MemoryEvidenceCardProps {
    memory: Memory;
}

export default function MemoryEvidenceCard({
    memory,
}: MemoryEvidenceCardProps) {
    return (
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-white">
                        {memory.id}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                        {memory.service}
                    </p>
                </div>

                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
                    {memory.days_ago} days ago
                </div>
            </div>

            <div className="mt-5 space-y-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        Change
                    </p>
                    <p className="mt-1 text-sm text-gray-200">
                        {memory.change}
                    </p>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        Outcome
                    </p>

                    <span className="mt-1 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-semibold">
                        {memory.outcome}
                    </span>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        Root Cause
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                        {memory.root_cause}
                    </p>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        Resolution
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                        {memory.resolution}
                    </p>
                </div>

                {memory.tags.length > 0 && (
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Tags
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {memory.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-gray-400"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}