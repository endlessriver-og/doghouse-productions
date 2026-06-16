import { STORY_BEATS } from "../game/data";
import { useGame } from "../game/store";
import { Button } from "./components";

export function StoryModal() {
  const id = useGame((s) => s.storyQueue[0]);
  const dismiss = useGame((s) => s.dismissStory);
  const beat = id ? STORY_BEATS[id] : undefined;
  if (!beat) return null;
  const big = id === "equity" || id === "elite";
  return (
    <div className="modal-backdrop">
      <div className={`modal story ${big ? "story-big" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="story-kicker">{big ? "★ MILESTONE" : "STORY"}</div>
        <h2 className="story-title">{beat.title}</h2>
        <p className="story-body">{beat.body}</p>
        <div className="row center">
          <Button variant="primary" onClick={dismiss}>Continue ▸</Button>
        </div>
      </div>
    </div>
  );
}
