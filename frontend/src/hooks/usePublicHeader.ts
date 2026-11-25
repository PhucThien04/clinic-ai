import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';

export function usePublicHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const routeKey = location.pathname + location.search;
  const [openedRoute, setOpenedRoute] = useState(routeKey);
  const isMenuOpen = menuOpen && openedRoute === routeKey;

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = () => { if (desktop.matches) setMenuOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [isMenuOpen]);

  return {menuOpen: isMenuOpen, menuButton,
    closeMenu: () => setMenuOpen(false),
    toggleMenu: () => {
      setOpenedRoute(routeKey);
      setMenuOpen(!isMenuOpen);
    }};
}
