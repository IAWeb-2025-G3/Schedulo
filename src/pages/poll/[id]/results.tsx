import * as React from "react";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";

type VoteValue = "yes" | "no" | "ifneedbe" | string;

function slotLabel(slot: any) {
  const date = slot?.date ?? "";
  const start = slot?.startTime ?? "";
  const end = slot?.endTime ?? "";
  return `${date} ${start}–${end}`;
}

export default function PollResultsPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { data: poll, isLoading, error } = trpc.poll.fetchPoll.useQuery(
    { id: id ?? "" },
    { enabled: !!id }
  );

  if (!id) return <div style={{ padding: 24 }}>Missing poll id.</div>;
  if (isLoading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error) return <div style={{ padding: 24 }}>Error: {error.message}</div>;
  if (!poll) return <div style={{ padding: 24 }}>Poll not found.</div>;

  const anyPoll: any = poll;

  const dates: Array<any> = Array.isArray(anyPoll.dates) ? anyPoll.dates : [];
  const votes: Array<any> = Array.isArray(anyPoll.votes) ? anyPoll.votes : [];

  const slotById = new Map<string, any>();
  for (const s of dates) {
    if (s?.id) slotById.set(String(s.id), s);
  }

  const resultsBySlot = new Map<
    string,
    {
      yes: number;
      ifneedbe: number;
      no: number;
      total: number;
      byName: Map<string, VoteValue>;
    }
  >();

  const ensureSlot = (slotId: string) => {
    const existing = resultsBySlot.get(slotId);
    if (existing) return existing;
    const fresh = { yes: 0, ifneedbe: 0, no: 0, total: 0, byName: new Map<string, VoteValue>() };
    resultsBySlot.set(slotId, fresh);
    return fresh;
  };

  for (const v of votes) {
    const slotId = String(v?.timeSlotId ?? "");
    if (!slotId) continue;

    const name = String(v?.name ?? "Anonymous");
    const value: VoteValue = String(v?.value ?? "").toLowerCase();

    const slotRes = ensureSlot(slotId);

    const prev = slotRes.byName.get(name);
    if (prev) {
      if (prev === "yes") slotRes.yes -= 1;
      else if (prev === "ifneedbe") slotRes.ifneedbe -= 1;
      else if (prev === "no") slotRes.no -= 1;
    } else {
      slotRes.total += 1;
    }

    slotRes.byName.set(name, value);

    if (value === "yes") slotRes.yes += 1;
    else if (value === "ifneedbe") slotRes.ifneedbe += 1;
    else if (value === "no") slotRes.no += 1;
  }

  const voters = Array.from(
    votes.reduce((set: Set<string>, v: any) => {
      const name = String(v?.name ?? "Anonymous");
      set.add(name);
      return set;
    }, new Set<string>())
  ).sort((a, b) => a.localeCompare(b));

  const sortedSlots = [...dates].sort((a, b) => {
    const ak = `${a?.date ?? ""} ${a?.startTime ?? ""}`;
    const bk = `${b?.date ?? ""} ${b?.startTime ?? ""}`;
    return ak.localeCompare(bk);
  });

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Poll results</h1>

      <div style={{ opacity: 0.85, marginBottom: 16 }}>
        <div>
          <b>Title:</b> {anyPoll.title ?? "(untitled)"}
        </div>
        {anyPoll.location ? (
          <div>
            <b>Location:</b> {anyPoll.location}
          </div>
        ) : null}
        {anyPoll.description ? (
          <div>
            <b>Description:</b> {anyPoll.description}
          </div>
        ) : null}
        <div>
          <b>Voters:</b> {voters.length}
        </div>
      </div>

      {/* Summary cards per slot */}
      <h2 style={{ fontSize: 18, margin: "18px 0 10px" }}>Time slots summary</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {sortedSlots.map((slot) => {
          const slotId = String(slot?.id ?? "");
          const r = resultsBySlot.get(slotId) ?? { yes: 0, ifneedbe: 0, no: 0, total: 0, byName: new Map() };
          const best = Math.max(r.yes, r.ifneedbe, r.no);
          const bestLabel =
            best === r.yes ? "yes" : best === r.ifneedbe ? "ifneedbe" : best === r.no ? "no" : "";

          return (
            <div
              key={slotId}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 700 }}>{slotLabel(slot)}</div>
                <div style={{ opacity: 0.9 }}>
                  <b>Yes:</b> {r.yes} &nbsp; <b>Maybe:</b> {r.ifneedbe} &nbsp; <b>No:</b> {r.no} &nbsp;{" "}
                  <span style={{ opacity: 0.8 }}>(votes: {r.total})</span>
                </div>
              </div>

              {r.total > 0 ? (
                <div style={{ marginTop: 10, opacity: 0.85 }}>
                  Most common: <b>{bestLabel}</b>
                </div>
              ) : (
                <div style={{ marginTop: 10, opacity: 0.85 }}>No votes for this slot yet.</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed matrix */}
      <h2 style={{ fontSize: 18, margin: "22px 0 10px" }}>Votes matrix</h2>

      {voters.length === 0 ? (
        <div>No votes yet.</div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Time slot</th>
                {voters.map((name) => (
                  <th key={name} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSlots.map((slot) => {
                const slotId = String(slot?.id ?? "");
                const r = resultsBySlot.get(slotId);
                return (
                  <tr key={slotId}>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee", fontWeight: 600 }}>
                      {slotLabel(slot)}
                    </td>
                    {voters.map((name) => {
                      const v = r?.byName.get(name);
                      const show = v ?? "—";
                      return (
                        <td key={name} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          {show}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
