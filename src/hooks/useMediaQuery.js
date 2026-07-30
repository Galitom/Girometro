import { useState, useEffect } from 'react';

// Live boolean for a CSS media query. Re-renders the component whenever the
// query starts/stops matching (resize, orientation change, devtools toggle).
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange(); // sync in case the query changed since the initial state
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// Phones — the breakpoint below which the app switches to its mobile layout
// (drawer sidebar, single-column grids, smaller display type).
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}
