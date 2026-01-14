---
name: Using GSAP with React
description: Best practices for integrating GSAP animations in React applications using the @gsap/react hook.
---

# GSAP with React Best Practices

This skill provides guidelines and patterns for using GSAP (GreenSock Animation Platform) effectively within React applications, specifically leveraging the official `@gsap/react` hook.

## 1. Installation and Setup

Always use the official `@gsap/react` package which simplifies cleanup and integration.

```bash
npm install gsap @gsap/react
```

### Registration
Register the `useGSAP` hook as a plugin to avoid discrepancies in React versions and ensure it's ready for use.

```tsx
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
```

## 2. Core Hook: `useGSAP()`

The `useGSAP()` hook is a drop-in replacement for `useEffect` or `useLayoutEffect`. It automatically handles cleanup by reverting all animations created during its execution.

### Basic Usage with Scope
Using a `scope` (a ref to a container element) is the recommended way to use selector text (e.g., `".box"`) safely within GSAP.

```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const MyComponent = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Selectors are scoped to 'container'
    gsap.to('.box', { x: 100, stagger: 0.1 });
  }, { scope: container });

  return (
    <div ref={container}>
      <div className="box">Box 1</div>
      <div className="box">Box 2</div>
    </div>
  );
};
```

### Advanced Config Object
For more control, pass a config object as the second argument.

```tsx
useGSAP(() => {
  gsap.to('.box', { x: endX });
}, { 
  dependencies: [endX], 
  scope: container, 
  revertOnUpdate: true // Reverts and re-runs when endX changes
});
```

- **`dependencies`**: Similar to `useEffect` dependency array. Defaults to `[]`.
- **`scope`**: Limits selector text to descendants of the provided React Ref.
- **`revertOnUpdate`**: Defaults to `false`. If `true`, the hook will revert and clean up everything when a dependency changes. If `false`, it only reverts on unmount.

## 3. Handling Interactions & Event Handlers

Animations created *inside* event handlers (like `onClick`) are NOT automatically cleaned up because they occur after the `useGSAP` hook has executed. Use `contextSafe` to make them "safe".

```tsx
const container = useRef<HTMLDivElement>(null);
const { contextSafe } = useGSAP({ scope: container });

const onClick = contextSafe(() => {
  // This animation will be reverted on unmount because it's 'contextSafe'
  // and selector text is scoped to 'container'
  gsap.to('.box', { rotation: '+=360' });
});

return (
  <div ref={container}>
    <div className="box">Animate Me</div>
    <button onClick={onClick}>Rotate</button>
  </div>
);
```

## 4. ScrollTrigger in React

When using `ScrollTrigger`, ensure you create it inside `useGSAP`. It will be automatically cleaned up.

```tsx
useGSAP(() => {
  gsap.to('.box', {
    scrollTrigger: {
      trigger: '.box',
      start: 'top center',
      scrub: true
    },
    x: 500
  });
}, { scope: container });
```

## 5. Controlling Animations: Refs vs State

- **Storing Timelines**: Use `useRef` to store timelines or tweens that you need to control (play/pause/reverse) later.
- **Reacting to State**: Pass dependencies to the `useGSAP` config object.

```tsx
const tl = useRef<gsap.core.Timeline>();
const [reversed, setReversed] = useState(false);

useGSAP(() => {
  tl.current = gsap.timeline().to('.box', { x: 100 });
}, { scope: container });

// Update on state change
useGSAP(() => {
  tl.current?.reversed(reversed);
}, [reversed]);
```

## 6. Component Communication

### Passing Timelines as Props
If a parent needs to orchestrate child animations, pass a timeline via **`useState`** (not `useRef`) to ensure the child can access it during its first render.

```tsx
// Parent
const [tl, setTl] = useState<gsap.core.Timeline>();
useGSAP(() => {
  setTl(gsap.timeline());
});
return <Child timeline={tl} />;

// Child
useGSAP(() => {
  timeline?.to(el.current, { opacity: 1 });
}, [timeline]);
```

## 7. Exit Animations

To animate an element as it leaves the DOM, use a state variable to control rendering and `onComplete` to update that state. Combine with `contextSafe` for reliability.

```tsx
const { contextSafe } = useGSAP({ scope: container });
const [isVisible, setIsVisible] = useState(true);

const remove = contextSafe(() => {
  gsap.to('.box', { 
    opacity: 0, 
    onComplete: () => setIsVisible(false) 
  });
});

return (
  <div ref={container}>
    {isVisible && <div className="box">Goodbye</div>}
    <button onClick={remove}>Exit</button>
  </div>
);
```

## 8. Next.js & Server-Side Rendering (SSR)

- Always use `"use client";` at the top of files using `useGSAP`.
- `useGSAP` handles "Isomorphic Layout Effect" internally (it uses `useLayoutEffect` on the client and `useEffect` on the server if needed).

## 9. Performance & Hygiene

1. **Revert is King**: `useGSAP` automatically calls `ctx.revert()`. Do not manually cleanup unless you have a very specific edge case.
2. **Avoid `useEffect`**: Always prefer `useGSAP` over `useEffect` or `useLayoutEffect` for animation logic.
3. **Scoped Selectors**: Use them to keep your code clean and avoid targeting elements outside the component.
4. **Register Plugins**: Ensure plugins like `ScrollTrigger`, `Flip`, or `Draggable` are registered with `gsap.registerPlugin(...)`.

## 10. Common Pitfalls

- **Creating Tweens Outside Hook**: Never create `gsap.to()` at the top level of a component or outside of `useGSAP`/`contextSafe`.
- **Missing Dependencies**: If your animation depends on a state/prop, include it in the dependency array of `useGSAP` to avoid stale closures.
- **Ref Mismanagement**: Always check `ref.current` before using it if you aren't using the `scope` parameter.
- **Strict Mode**: React 18 Strict Mode runs effects twice in dev. `useGSAP` handles this correctly by reverting the first set of animations, but only if you use it correctly!
