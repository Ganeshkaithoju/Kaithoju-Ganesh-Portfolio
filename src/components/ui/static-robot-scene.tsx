"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SplineScene } from "@/components/ui/splite";

type RobotState = "idle" | "contact-typing" | "contact-paused";

const IDLE_POSE = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  x: 0,
  y: 0,
};

const CONTACT_TYPING_POSE = {
  rotateY: 22,
  rotateX: 4,
  rotateZ: -2,
  x: 20,
  y: -4,
};

const CONTACT_PAUSED_POSE = {
  rotateY: -28,
  rotateX: 0,
  rotateZ: 0,
  x: -10,
  y: 0,
};

export function StaticRobotScene() {
  const [isClient, setIsClient] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [robotState, setRobotState] = useState<RobotState>("idle");
  const splineAppRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const topPartRef = useRef<any>(null);
  const targetRotationRef = useRef({ x: 0, y: 0.1 });
  const currentRotationRef = useRef({ x: 0, y: 0.1 });
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check client mounting and wide screen dimension (~1700px threshold for 1920x1080 display space)
  useEffect(() => {
    setIsClient(true);

    const checkDimensions = () => {
      setIsWideScreen(window.innerWidth >= 1700);
    };

    checkDimensions();
    window.addEventListener("resize", checkDimensions, { passive: true });
    return () => window.removeEventListener("resize", checkDimensions);
  }, []);

  // RAF Animation loop: directly and smoothly drives the Head object's Euler angles (pitch & yaw)
  // Completely eliminates Spline's LookAt gimbal flips and keeps roll strictly at 0.
  useEffect(() => {
    if (!isWideScreen) return;
    let animationFrameId: number;

    const animate = () => {
      const head = headRef.current;
      const topPart = topPartRef.current;
      const app = splineAppRef.current;

      if (head && head.rotation) {
        const target = targetRotationRef.current;
        const current = currentRotationRef.current;

        // Smooth organic damping
        const dx = target.x - current.x;
        const dy = target.y - current.y;

        if (Math.abs(dx) > 0.0002 || Math.abs(dy) > 0.0002) {
          current.x += dx * 0.08;
          current.y += dy * 0.08;

          // Directly drive Euler angles:
          // rotation.x = pitch (nodding within safe natural bounds, no arching)
          // rotation.y = yaw (turning left and right)
          // rotation.z = roll (strictly 0, eliminating sideways neck tilt)
          head.rotation.x = current.x;
          head.rotation.y = current.y;
          head.rotation.z = 0;
          head.updateMatrix?.();

          // Ensure torso ("Top part") remains strictly upright in standing posture
          if (topPart && topPart.rotation) {
            topPart.rotation.x = 0;
            topPart.rotation.y = 0;
            topPart.rotation.z = 0;
            topPart.updateMatrix?.();
          }

          app?.requestRender?.();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isWideScreen]);

  // Global mousemove tracking for regular/idle scenario:
  // Maps viewport cursor dimensions to safe, natural ergonomic head pitch and yaw bounds.
  useEffect(() => {
    if (!isWideScreen) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (robotState === "idle") {
        const screenW = window.innerWidth || 1920;
        const screenH = window.innerHeight || 1080;

        // Normalized cursor coordinates across the active viewport (0 to 1)
        const normX = Math.min(1, Math.max(0, e.clientX / screenW));
        const normY = Math.min(1, Math.max(0, e.clientY / screenH));

        // Horizontal turn (yaw):
        // -0.28 rad (~ -16° left) to +0.48 rad (~ +27.5° right toward content)
        const targetYaw = -0.28 + normX * 0.76;

        // Vertical nod (pitch):
        // -0.20 rad (~ -11.5° up toward header) to +0.12 rad (~ +7° down toward bottom)
        const targetPitch = -0.20 + normY * 0.32;

        targetRotationRef.current = {
          x: targetPitch,
          y: targetYaw,
        };
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleWindowMouseMove);
  }, [isWideScreen, robotState]);

  // Direct robot head to look at the active contact form input being typed in
  const lookAtActiveInput = useCallback(() => {
    const activeEl = document.activeElement;
    if (activeEl && typeof activeEl.getBoundingClientRect === "function") {
      const rect = activeEl.getBoundingClientRect();
      const screenW = window.innerWidth || 1920;
      const screenH = window.innerHeight || 1080;

      const normX = Math.min(1, Math.max(0, (rect.left + rect.width / 2) / screenW));
      const normY = Math.min(1, Math.max(0, (rect.top + rect.height / 2) / screenH));

      targetRotationRef.current = {
        x: Math.min(0.08, Math.max(-0.15, -0.15 + normY * 0.25)),
        y: Math.min(0.55, Math.max(0.30, -0.10 + normX * 0.65)),
      };
      return;
    }

    // Fallback: look comfortably toward contact form (right-center)
    targetRotationRef.current = { x: -0.05, y: 0.44 };
  }, []);

  // Listen to Contact Form interaction events (typing vs paused vs idle)
  useEffect(() => {
    if (!isWideScreen) return;

    const isContactElement = (target: HTMLElement | null): boolean => {
      if (!target) return false;
      return !!target.closest('#contact, form[aria-label="Contact form"]');
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (isContactElement(target)) {
        // User focused inside contact form: start paused looking toward left until typing begins
        setRobotState("contact-paused");
      }
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (isContactElement(target)) {
        // Special Case 1: User is actively typing in the contact form
        setRobotState("contact-typing");
        lookAtActiveInput();

        // Reset debounce timer
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }

        // When user stops typing: after 1000ms transition to contact-paused (look toward left = 0)
        typingTimerRef.current = setTimeout(() => {
          setRobotState("contact-paused");
        }, 1000);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      // When focus leaves the contact form completely: immediately restore idle state
      if (!isContactElement(relatedTarget)) {
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        setRobotState("idle");
      }
    };

    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("input", handleInput, true);
    document.addEventListener("focusout", handleFocusOut, true);

    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("focusout", handleFocusOut, true);
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [isWideScreen, lookAtActiveInput]);

  // Execute gaze changes whenever robotState changes
  useEffect(() => {
    if (!isWideScreen) return;

    if (robotState === "contact-typing") {
      // Special Case 1: Look directly at active input being typed
      lookAtActiveInput();
    } else if (robotState === "contact-paused") {
      // Special Case 2: When user stops typing, look away toward left = 0
      targetRotationRef.current = { x: 0, y: -0.42 };
    } else {
      // Regular idle mode: restore forward neutral gaze
      targetRotationRef.current = { x: 0, y: 0.12 };
    }
  }, [robotState, isWideScreen, lookAtActiveInput]);

  // Configure Spline once loaded:
  // 1. Completely disconnect and neutralize Spline's internal LookAt handler
  //    so it stops listening to window pointermove and stops applying unbounded raycasts.
  // 2. Disconnect and neutralize Spline's internal Scroll event handler.
  // 3. Acquire references to "Head" and "Top part" for direct Euler angle control.
  const handleSplineLoad = useCallback((app: any) => {
    splineAppRef.current = app;

    try {
      const eventManager = app.eventManager || app._eventManager;
      if (eventManager && eventManager.handlers) {
        // Disconnect Spline's internal LookAt handler
        const lookAtHandler = eventManager.handlers.LookAt;
        if (lookAtHandler) {
          if (typeof lookAtHandler.disconnect === "function") {
            lookAtHandler.disconnect();
          }
          lookAtHandler.events = [];
          lookAtHandler.onMouseMove = () => {};
          lookAtHandler.onScroll = () => {};
        }

        // Disconnect Spline's internal Scroll handler
        const scrollHandler = eventManager.handlers.Scroll;
        if (scrollHandler) {
          if (typeof scrollHandler.disconnect === "function") {
            scrollHandler.disconnect();
          }
          scrollHandler.onScroll = () => {};
          scrollHandler.onWheel = () => {};
        }
      }

      // Acquire Head object reference and initialize to neutral forward gaze
      const head = app.findObjectByName?.("Head");
      if (head && head.rotation) {
        headRef.current = head;
        head.rotation.x = 0;
        head.rotation.y = 0.1;
        head.rotation.z = 0;
        head.updateMatrix?.();
      }

      // Acquire Top part (torso) reference and lock strictly upright
      const topPart = app.findObjectByName?.("Top part");
      if (topPart && topPart.rotation) {
        topPartRef.current = topPart;
        topPart.rotation.x = 0;
        topPart.rotation.y = 0;
        topPart.rotation.z = 0;
        topPart.updateMatrix?.();
      }

      app.requestRender?.();
    } catch {
      // Graceful fallback
    }
  }, []);

  // Guard against SSR and screen sizes smaller than ~1700px (1920x1080 display space)
  if (!isClient || !isWideScreen) {
    return null;
  }

  // Motion variants matching the explicit state machine
  const motionVariants = {
    idle: IDLE_POSE,
    "contact-typing": CONTACT_TYPING_POSE,
    "contact-paused": CONTACT_PAUSED_POSE,
  };

  return (
    <div
      className="fixed bottom-0 left-0 z-30 pointer-events-none select-none hidden min-[1700px]:block"
      style={{
        width: "360px",
        height: "520px",
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={motionVariants[robotState]}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full h-full relative pointer-events-auto"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Interactive 3D Robot in persistent standing posture with direct Euler head control */}
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full bg-transparent"
          onLoad={handleSplineLoad}
        />
      </motion.div>
    </div>
  );
}

export default StaticRobotScene;
