import { NavigationDrawer } from './NavigationDrawer';

export function GlobalNavigation() {
  return (
    <div className="fixed top-12 left-3 z-[100]">
      <NavigationDrawer />
    </div>
  );
}
