class Profilo{
    constructor(page,LoadCSS){
        if (typeof LoadCSS === 'function') LoadCSS();
        this.page=page;
        console.log('Profilo component initialized');
        this.init();
    }

    async init(){
        document.title = "Profilo";
        await this.render();
    }

    async render(){
        // Esegui direttamente la logica, il DOM è già pronto
        console.log('action listener attivo');
        const profileCard = document.querySelector('.profile-card');
        if (!profileCard) return;

        // Bottone modifica inline
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-primary w-100 my-3';
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i> Modifica Profilo';
        profileCard.appendChild(editBtn);

        // Elementi per la foto profilo
        const avatar = document.querySelector('.profile-avatar');
        const editPicBtn = document.getElementById('editPicBtn');
        const profilePicForm = document.getElementById('profilePicForm');
        editBtn.addEventListener('click', () => {
            // Mostra la matitina centrata
            if (editPicBtn) editPicBtn.style.display = '';
            // Mostra i campi in modalità modifica come prima
            const nomeCognome = profileCard.querySelector('h2').textContent.split(' ');
            const nome = nomeCognome[0] || '';
            const cognome = nomeCognome[1] || '';
            const email = profileCard.querySelector('.text-muted').textContent.match(/([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/);
            const telefono = profileCard.querySelector('.profile-details dd').textContent.trim() || '';

            profileCard.querySelector('h2').innerHTML = `<input type="text" id="editNome" value="${nome}" class="form-control mb-2" style="max-width:140px;display:inline-block;"> <input type="text" id="editCognome" value="${cognome}" class="form-control mb-2" style="max-width:140px;display:inline-block;">`;
            profileCard.querySelector('.text-muted').innerHTML = `<i class="bi bi-envelope"></i> <input type="email" id="editEmail" value="${email ? email[1] : ''}" class="form-control mb-2" style="max-width:220px;display:inline-block;">`;
            profileCard.querySelector('.profile-details dd').innerHTML = `<input type="text" id="editTelefono" value="${telefono}" class="form-control mb-2" style="max-width:180px;display:inline-block;">`;

            // Bottone salva
            editBtn.style.display = 'none';
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn btn-success w-100 my-3';
            saveBtn.innerHTML = '<i class="bi bi-check2"></i> Salva Modifiche';
            profileCard.appendChild(saveBtn);

            saveBtn.addEventListener('click', async () => {
                const data = {
                    nome: document.getElementById('editNome').value ? document.getElementById('editNome').value : null,
                    cognome: document.getElementById('editCognome').value ? document.getElementById('editCognome').value : null,
                    email: document.getElementById('editEmail').value ? document.getElementById('editEmail').value : null,
                    telefono: document.getElementById('editTelefono').value ? document.getElementById('editTelefono').value : null
                };
                if(!data.nome && !data.cognome && !data.email && !data.telefono) {
                    console.log('Nessun campo compilato');
                }
                saveBtn.disabled = true;
                saveBtn.textContent = 'Salvataggio...';
                const msgDiv = document.getElementById('editProfileMsg') || (() => {
                    const d = document.createElement('div');
                    d.id = 'editProfileMsg';
                    profileCard.appendChild(d);
                    return d;
                })();
                fetch('/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify(data)
                })
                .then(async res => {
                    let result;
                    try {
                        result = await res.json();
                    } catch (e) {
                        result = {};
                    }
                    if (res.status === 401) {
                        msgDiv.textContent = 'Sessione scaduta, effettua di nuovo il login.';
                        setTimeout(() => window.location.href = '/Login', 1500);
                    } else if (res.status === 500) {
                        msgDiv.textContent = 'Errore interno, riprova più tardi.';
                    } else if (result.success) {
                        msgDiv.textContent = 'Profilo aggiornato!';
                        if (editPicBtn) editPicBtn.style.display = 'none';
                        setTimeout(() => window.location.reload(), 1200);
                    } else {
                        msgDiv.textContent = result.error || 'Errore aggiornamento';
                    }
                })
                .catch((err) => {
                    msgDiv.textContent = 'Errore imprevisto: ' + (err?.message || 'Errore di rete');
                });
            });

            // Assicuro che il modal si apra correttamente al click sulla matitina
            if (editPicBtn) {
                editPicBtn.onclick = function(e) {
                    e.preventDefault();
                    const modal = document.getElementById('uploadPicModal');
                    if (modal) {
                        const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
                        bsModal.show();
                    }
                };
            }
        });

        // Gestione submit del form modal
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const saveBtn = editProfileForm.querySelector('button[type="submit"]');
                let msgDiv = document.getElementById('editProfileMsg');
                if (!msgDiv) {
                    msgDiv = document.createElement('div');
                    msgDiv.id = 'editProfileMsg';
                    editProfileForm.appendChild(msgDiv);
                }
                const nome = document.getElementById('editNome')?.value?.trim();
                const cognome = document.getElementById('editCognome')?.value?.trim();
                const email = document.getElementById('editEmail')?.value?.trim();
                const telefono = document.getElementById('editTelefono')?.value?.trim();
                if (!nome || !cognome || !email) {
                    msgDiv.textContent = 'Compila tutti i campi obbligatori.';
                    return;
                }
                if (saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Salvataggio...';
                }
                fetch('/Me/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ nome, cognome, email, telefono })
                })
                .then(async res => {
                    let result;
                    try {
                        result = await res.json();
                    } catch (e) {
                        result = {};
                    }
                    if (res.status === 401) {
                        msgDiv.textContent = 'Sessione scaduta, effettua di nuovo il login.';
                        setTimeout(() => window.location.href = '/Login', 1500);
                    } else if (res.status === 500) {
                        msgDiv.textContent = 'Errore interno, riprova più tardi.';
                    } else if (result.success) {
                        msgDiv.textContent = 'Profilo aggiornato!';
                        setTimeout(() => window.location.reload(), 1200);
                    } else {
                        msgDiv.textContent = result.error || 'Errore aggiornamento';
                    }
                })
                .catch((err) => {
                    msgDiv.textContent = 'Errore imprevisto: ' + (err?.message || 'Errore di rete');
                })
                .finally(() => {
                    if (saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Salva modifiche';
                    }
                });
            });
        }

        // Avatar animation on click
        if (avatar) {
            avatar.addEventListener('click', function() {
                this.classList.add('animate__animated', 'animate__rubberBand');
                this.addEventListener('animationend', () => {
                    this.classList.remove('animate__animated', 'animate__rubberBand');
                }, {once: true});
            });
        }

        // Gestione upload foto profilo tramite modal
        if (profilePicForm) {
            // Aggiorna l'icona della navbar in tempo reale quando selezioni una nuova immagine
            const fileInput = document.getElementById('profilePicInput');
            if (fileInput) {
                fileInput.addEventListener('change', function() {
                    if (fileInput.files && fileInput.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            // Aggiorna avatar nella card
                            const img = avatar.querySelector('img');
                            if (img) img.src = e.target.result;
                            // Aggiorna avatar nella navbar
                            const navProfileImg = document.querySelector('#Profilo img');
                            if (navProfileImg) navProfileImg.src = e.target.result;
                        };
                        reader.readAsDataURL(fileInput.files[0]);
                    }
                });
            }
            profilePicForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const fileInput = document.getElementById('profilePicInput');
                const msg = document.getElementById('uploadPicMsg');
                if (!fileInput.files[0]) {
                    msg.textContent = 'Seleziona una foto!';
                    return;
                }
                const formData = new FormData();
                formData.append('profilePic', fileInput.files[0]);
                msg.textContent = 'Caricamento...';
                try {
                    const res = await fetch('/update-profile-pic', {
                        method: 'PUT',
                        credentials: 'same-origin',
                        body: formData
                    });
                    const result = await res.json();
                    if (result.success && result.imageUrl) {
                        // Aggiorna avatar
                        const img = avatar.querySelector('img');
                        if (img) img.src = result.imageUrl + '?t=' + Date.now();
                        // Aggiorna avatar nella navbar
                        const navProfileImg = document.querySelector('#Profilo img');
                        if (navProfileImg) navProfileImg.src = result.imageUrl + '?t=' + Date.now();
                        msg.textContent = 'Foto aggiornata!';
                        // Chiudi modal Bootstrap
                        const modal = document.getElementById('uploadPicModal');
                        if (modal) {
                            const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
                            bsModal.hide();
                        }
                        // La matita rimane visibile
                        if (editPicBtn) editPicBtn.style.display = '';
                    } else {
                        msg.textContent = result.error || 'Errore caricamento foto';
                    }
                } catch (err) {
                    msg.textContent = 'Errore di rete';
                }
            });
        }
    }

}

export default Profilo;