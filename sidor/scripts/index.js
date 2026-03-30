function toggleFooter(btn) {
    const links = btn.nextElementSibling
    const arrow = btn.querySelector('span')
    const isOpen = links.style.display === 'flex'
    links.style.display = isOpen ? 'none' : 'flex'
    arrow.textContent = isOpen ? '▼' : '▲'
}
