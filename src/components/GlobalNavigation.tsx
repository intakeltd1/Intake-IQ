import { NavigationDrawer } from './NavigationDrawer';

export function GlobalNavigation() {
  return (
    <div className="fixed top-[105px] left-6 z-[100] md:top-[115px]">
      <NavigationDrawer />
    </div>
  );
}
