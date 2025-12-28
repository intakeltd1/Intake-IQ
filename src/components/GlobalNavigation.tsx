import { NavigationDrawer } from './NavigationDrawer';

export function GlobalNavigation() {
  return (
    <div className="fixed top-4 left-4 z-[100]">
      <NavigationDrawer />
    </div>
  );
}
