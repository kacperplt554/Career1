// Start aplikacji: wczytanie zapisu → menu.
window.addEventListener('error', e => FL.toast('Błąd: ' + e.message, true));
window.addEventListener('unhandledrejection', e => FL.toast('Błąd: ' + ((e.reason && e.reason.message) || e.reason), true));
FL.state.load().then(() => FL.router.go('menu'));
