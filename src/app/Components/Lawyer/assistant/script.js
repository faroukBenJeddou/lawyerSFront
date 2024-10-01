document.querySelectorAll('.m-link').forEach(item => {
  item.addEventListener('click', event => {
    event.preventDefault();
    let targetMenu = document.getElementById(item.getAttribute('data-target'));

    // Close all submenus
    document.querySelectorAll('.sub-menu').forEach(menu => {
      if (menu !== targetMenu) {
        menu.style.display = 'none';
      }
    });

    // Toggle the clicked submenu
    if (targetMenu.style.display === 'none' || targetMenu.style.display === '') {
      targetMenu.style.display = 'block';
    } else {
      targetMenu.style.display = 'none';
    }
  });
});
