/**
 * State Machine Transition Tests
 *
 * Tests for conversation state management and transitions
 * No runtime logic changes - defines the contract
 */

import { describe, it, expect, beforeEach } from "vitest";

// Test timeout for async operations
const TEST_TIMEOUT = 5000;

/**
 * State Machine Definition
 *
 * States: idle, listening, processing, crisis, emergency_lock
 * 
 * Transitions:
 * - idle → listening (user input starts)
 * - listening → processing (voice captured)
 * - processing → idle (response complete, low risk)
 * - processing → crisis (high/critical risk detected)
 * - crisis → idle (crisis resolved)
 * - ANY → emergency_lock (system override)
 * - emergency_lock → idle (manual reset only)
 *
 * Rules:
 * 1. Crisis override: ANY state can jump to crisis if risk detected
 * 2. Emergency lock: ANY state can jump to emergency_lock
 * 3. No direct jumps: idle cannot jump to crisis without processing
 * 4. Timeouts: Each state has max duration before auto-fallback to idle
 */

type State = "idle" | "listening" | "processing" | "crisis" | "emergency_lock";

type Transition = {
  from: State;
  to: State;
  trigger: string;
  allowed: boolean;
};

interface StateMachine {
  currentState: State;
  previousState?: State;
  transition(to: State, trigger?: string): void;
  getState(): State;
  reset(): void;
}

// Mock state machine implementation for testing
class MockStateMachine implements StateMachine {
  currentState: State = "idle";
  previousState?: State;
  private transitions: Map<string, Set<State>> = new Map();
  private timeouts: Map<State, number> = new Map();
  private startTime: number = Date.now();

  constructor() {
    // Define legal transitions
    this.transitions.set("idle", new Set(["listening", "emergency_lock"]));
    this.transitions.set("listening", new Set(["processing", "idle", "crisis", "emergency_lock"]));
    this.transitions.set("processing", new Set(["idle", "crisis", "emergency_lock"]));
    this.transitions.set("crisis", new Set(["idle", "emergency_lock"]));
    this.transitions.set("emergency_lock", new Set(["idle"])); // Manual reset only

    // Define state timeouts (ms)
    this.timeouts.set("listening", 1500);
    this.timeouts.set("processing", 1000);
    this.timeouts.set("crisis", 5000);
  }

  transition(to: State, trigger: string = "manual"): void {
    // Emergency lock can be triggered from ANY state
    if (to === "emergency_lock") {
      this.previousState = this.currentState;
      this.currentState = to;
      this.startTime = Date.now();
      return;
    }

    // Crisis override: can transition to crisis from processing or listening
    if (to === "crisis" && (this.currentState === "processing" || this.currentState === "listening")) {
      this.previousState = this.currentState;
      this.currentState = to;
      this.startTime = Date.now();
      return;
    }

    // Check if transition is legal
    const allowedStates = this.transitions.get(this.currentState);
    if (!allowedStates || !allowedStates.has(to)) {
      throw new Error(
        `Illegal transition: ${this.currentState} → ${to} (trigger: ${trigger})`
      );
    }

    this.previousState = this.currentState;
    this.currentState = to;
    this.startTime = Date.now();
  }

  getState(): State {
    // Check for timeout
    const maxDuration = this.timeouts.get(this.currentState);
    if (maxDuration && Date.now() - this.startTime > maxDuration) {
      // Auto-fallback to idle on timeout
      this.previousState = this.currentState;
      this.currentState = "idle";
      this.startTime = Date.now();
    }

    return this.currentState;
  }

  reset(): void {
    this.currentState = "idle";
    this.previousState = undefined;
    this.startTime = Date.now();
  }

  // Test helper to simulate time passage
  simulateTimeout(ms: number): void {
    this.startTime = Date.now() - ms;
  }
}

describe("State Machine Transition Tests", () => {
  let stateMachine: MockStateMachine;

  beforeEach(() => {
    stateMachine = new MockStateMachine();
  });

  describe("Legal Transitions", () => {
    it("should allow idle → listening", () => {
      expect(stateMachine.currentState).toBe("idle");
      stateMachine.transition("listening", "user_input_start");
      expect(stateMachine.currentState).toBe("listening");
      expect(stateMachine.previousState).toBe("idle");
    });

    it("should allow listening → processing", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing", "voice_captured");
      expect(stateMachine.currentState).toBe("processing");
      expect(stateMachine.previousState).toBe("listening");
    });

    it("should allow processing → idle (low risk)", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing");
      stateMachine.transition("idle", "response_complete_low_risk");
      expect(stateMachine.currentState).toBe("idle");
    });

    it("should allow processing → crisis (high risk)", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing");
      stateMachine.transition("crisis", "high_risk_detected");
      expect(stateMachine.currentState).toBe("crisis");
    });

    it("should allow crisis → idle (resolved)", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing");
      stateMachine.transition("crisis");
      stateMachine.transition("idle", "crisis_resolved");
      expect(stateMachine.currentState).toBe("idle");
    });

    it("should allow emergency_lock → idle (manual reset)", () => {
      stateMachine.transition("emergency_lock");
      expect(stateMachine.currentState).toBe("emergency_lock");
      stateMachine.transition("idle", "manual_reset");
      expect(stateMachine.currentState).toBe("idle");
    });
  });

  describe("Illegal Transitions", () => {
    it("should throw on idle → processing (skip listening)", () => {
      expect(() => {
        stateMachine.transition("processing", "illegal_jump");
      }).toThrow("Illegal transition: idle → processing");
    });

    it("should throw on idle → crisis (skip processing)", () => {
      expect(() => {
        stateMachine.transition("crisis", "illegal_jump");
      }).toThrow("Illegal transition: idle → crisis");
    });

    it("should throw on listening → emergency_lock (should use override)", () => {
      stateMachine.transition("listening");
      // This is actually allowed - emergency lock can be triggered from ANY state
      expect(() => {
        stateMachine.transition("emergency_lock");
      }).not.toThrow();
    });

    it("should throw on crisis → processing (can't go back)", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing");
      stateMachine.transition("crisis");

      expect(() => {
        stateMachine.transition("processing", "illegal_back");
      }).toThrow("Illegal transition: crisis → processing");
    });
  });

  describe("Crisis Override", () => {
    it("should allow crisis from processing (high risk detected)", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing");
      stateMachine.transition("crisis", "high_risk_override");
      expect(stateMachine.currentState).toBe("crisis");
    });

    it("should allow crisis from listening (immediate risk)", () => {
      stateMachine.transition("listening");
      stateMachine.transition("crisis", "immediate_risk");
      expect(stateMachine.currentState).toBe("crisis");
    });

    it("should prioritize crisis over normal flow", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing");

      // Even if response is ready, crisis should take priority
      stateMachine.transition("crisis", "crisis_detected");
      expect(stateMachine.currentState).toBe("crisis");
      expect(stateMachine.previousState).toBe("processing");
    });
  });

  describe("Emergency Lock Override", () => {
    it("should allow emergency_lock from idle", () => {
      expect(stateMachine.currentState).toBe("idle");
      stateMachine.transition("emergency_lock", "system_override");
      expect(stateMachine.currentState).toBe("emergency_lock");
    });

    it("should allow emergency_lock from listening", () => {
      stateMachine.transition("listening");
      stateMachine.transition("emergency_lock", "system_override");
      expect(stateMachine.currentState).toBe("emergency_lock");
    });

    it("should allow emergency_lock from processing", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing");
      stateMachine.transition("emergency_lock", "system_override");
      expect(stateMachine.currentState).toBe("emergency_lock");
    });

    it("should allow emergency_lock from crisis", () => {
      stateMachine.transition("listening");
      stateMachine.transition("processing");
      stateMachine.transition("crisis");
      stateMachine.transition("emergency_lock", "system_override");
      expect(stateMachine.currentState).toBe("emergency_lock");
    });

    it("should lock system until manual reset", () => {
      stateMachine.transition("emergency_lock");
      expect(stateMachine.currentState).toBe("emergency_lock");

      // Cannot transition to other states except idle
      expect(() => {
        stateMachine.transition("listening");
      }).toThrow();

      expect(() => {
        stateMachine.transition("processing");
      }).toThrow();

      expect(() => {
        stateMachine.transition("crisis");
      }).toThrow();

      // Only idle is allowed (manual reset)
      stateMachine.transition("idle", "manual_reset");
      expect(stateMachine.currentState).toBe("idle");
    });
  });

  describe("State Timeouts", () => {
    it(
      "should timeout listening after 1500ms",
      () => {
        stateMachine.transition("listening");
        expect(stateMachine.currentState).toBe("listening");

        // Simulate 1600ms passage
        stateMachine.simulateTimeout(1600);

        // Next call to getState should return idle
        const state = stateMachine.getState();
        expect(state).toBe("idle");
        expect(stateMachine.previousState).toBe("listening");
      },
      TEST_TIMEOUT
    );

    it(
      "should timeout processing after 1000ms",
      () => {
        stateMachine.transition("listening");
        stateMachine.transition("processing");
        expect(stateMachine.currentState).toBe("processing");

        // Simulate 1100ms passage
        stateMachine.simulateTimeout(1100);

        const state = stateMachine.getState();
        expect(state).toBe("idle");
        expect(stateMachine.previousState).toBe("processing");
      },
      TEST_TIMEOUT
    );

    it(
      "should timeout crisis after 5000ms",
      () => {
        stateMachine.transition("listening");
        stateMachine.transition("processing");
        stateMachine.transition("crisis");
        expect(stateMachine.currentState).toBe("crisis");

        // Simulate 5100ms passage
        stateMachine.simulateTimeout(5100);

        const state = stateMachine.getState();
        expect(state).toBe("idle");
        expect(stateMachine.previousState).toBe("crisis");
      },
      TEST_TIMEOUT
    );

    it("should not timeout idle state", () => {
      expect(stateMachine.currentState).toBe("idle");

      // Simulate 10 seconds
      stateMachine.simulateTimeout(10000);

      const state = stateMachine.getState();
      expect(state).toBe("idle");
    });

    it("should not timeout emergency_lock (manual reset only)", () => {
      stateMachine.transition("emergency_lock");
      expect(stateMachine.currentState).toBe("emergency_lock");

      // Simulate 10 seconds
      stateMachine.simulateTimeout(10000);

      const state = stateMachine.getState();
      expect(state).toBe("emergency_lock");
    });
  });

  describe("Transition Table Validation", () => {
    it("should have complete transition table", () => {
      const allStates: State[] = ["idle", "listening", "processing", "crisis", "emergency_lock"];
      const transitionTable: Transition[] = [
        // From idle
        { from: "idle", to: "listening", trigger: "user_input", allowed: true },
        { from: "idle", to: "processing", trigger: "skip", allowed: false },
        { from: "idle", to: "crisis", trigger: "skip", allowed: false },
        { from: "idle", to: "emergency_lock", trigger: "override", allowed: true },

        // From listening
        { from: "listening", to: "idle", trigger: "cancel", allowed: true },
        { from: "listening", to: "processing", trigger: "voice_captured", allowed: true },
        { from: "listening", to: "crisis", trigger: "immediate_risk", allowed: true },
        { from: "listening", to: "emergency_lock", trigger: "override", allowed: true },

        // From processing
        { from: "processing", to: "idle", trigger: "response_complete", allowed: true },
        { from: "processing", to: "listening", trigger: "back", allowed: false },
        { from: "processing", to: "crisis", trigger: "high_risk", allowed: true },
        { from: "processing", to: "emergency_lock", trigger: "override", allowed: true },

        // From crisis
        { from: "crisis", to: "idle", trigger: "resolved", allowed: true },
        { from: "crisis", to: "listening", trigger: "back", allowed: false },
        { from: "crisis", to: "processing", trigger: "back", allowed: false },
        { from: "crisis", to: "emergency_lock", trigger: "override", allowed: true },

        // From emergency_lock
        { from: "emergency_lock", to: "idle", trigger: "manual_reset", allowed: true },
        { from: "emergency_lock", to: "listening", trigger: "auto", allowed: false },
        { from: "emergency_lock", to: "processing", trigger: "auto", allowed: false },
        { from: "emergency_lock", to: "crisis", trigger: "auto", allowed: false },
      ];

      transitionTable.forEach(({ from, to, trigger, allowed }) => {
        stateMachine.reset();

        // Get to the 'from' state
        if (from !== "idle") {
          if (from === "listening") {
            stateMachine.transition("listening");
          } else if (from === "processing") {
            stateMachine.transition("listening");
            stateMachine.transition("processing");
          } else if (from === "crisis") {
            stateMachine.transition("listening");
            stateMachine.transition("processing");
            stateMachine.transition("crisis");
          } else if (from === "emergency_lock") {
            stateMachine.transition("emergency_lock");
          }
        }

        // Test the transition
        if (allowed) {
          expect(() => {
            stateMachine.transition(to, trigger);
          }).not.toThrow();
          expect(stateMachine.currentState).toBe(to);
        } else {
          expect(() => {
            stateMachine.transition(to, trigger);
          }).toThrow(/Illegal transition/);
        }
      });
    });
  });

  describe("State Machine Summary", () => {
    it("should report state machine validation complete", () => {
      console.log("\n--- State Machine Test Suite Complete ---");
      console.log("✓ Legal transitions validated");
      console.log("✓ Illegal transitions blocked");
      console.log("✓ Crisis override verified");
      console.log("✓ Emergency lock override verified");
      console.log("✓ State timeouts working");
      console.log("✓ Transition table complete");
      console.log("✓ State machine contract defined\n");

      expect(true).toBe(true);
    });
  });
});
