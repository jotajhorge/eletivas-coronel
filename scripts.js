// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    addDoc,
    collection,
    where,
    onSnapshot,
    updateDoc,
    getDocs,
    getDoc,
    query
}
    from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

var categorias = []
var indexSelected = -1
var alunos = []

const firebaseConfig = {
    apiKey: "AIzaSyDEyu-tPkfveVEEHopkK1hBquYiWCQ_UiM",
    authDomain: "eletiva-ba09f.firebaseapp.com",
    databaseURL: "https://eletiva-ba09f-default-rtdb.firebaseio.com",
    projectId: "eletiva-ba09f",
    storageBucket: "eletiva-ba09f.firebasestorage.app",
    messagingSenderId: "784050976450",
    appId: "1:784050976450:web:da8ef46ffee5670efc6d5b",
    measurementId: "G-7RR1TP5KLZ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveResponse() {
    const nome = document.querySelector("#name").value
    const turma = document.querySelector("#class").value
    if (nome != '' && turma != '') {
        if (!alunos.some(aluno => aluno.NomeCompleto === nome.toUpperCase())) {
            if (categorias[indexSelected]) {
                if (categorias[indexSelected].vagas > 0) {
                    const q = query(collection(db, "Categorias"), where("nome", "==", `${categorias[indexSelected].nome}`))
                    const itemReference = (await getDocs(q)).docs[0].ref
                    const vagasDisponiveis = (await getDoc(itemReference)).data().vagas
                    if (vagasDisponiveis > 0) {
                        await addDoc(collection(db, "Alunos"), {
                            "NomeCompleto": nome.toUpperCase(),
                            "Turma": turma.toUpperCase(),
                            "CategoriaEscolhida": categorias[indexSelected].nome
                        })
                        await updateDoc(itemReference, { vagas: vagasDisponiveis - 1 })
                        alert("Sua escolha foi salva com sucesso!")
                        location.reload()
                    } else {
                        alert("Não há mais vagas disponíveis para essa categoria.")
                    }

                } else {
                    alert("Não há mais vagas disponíveis para essa categoria.")
                }
            } else {
                alert("Categoria inexistente ou não selecionada.")
            }
        } else {
            alert("Esse aluno já fez a sua escolha.")
        }
    } else {
        alert("O nome do aluno e sua turma, devem ser preenchidos")
    }


}

function createButtons() {
    document.getElementById('options-container').innerHTML = ''

    categorias.map((item, index) => {
        const button = document.createElement('button')
        button.className = 'option-button'
        button.name = `${item.nome}`
        button.textContent = `${item.nome} (${item.vagas} vagas)`;
        button.onclick = () => {
            indexSelected = index
            const buttons = document.querySelectorAll(".option-button")
            buttons.forEach(b => b.style.backgroundColor = '#4CAF50')

            button.style.backgroundColor = "blue"
        }

        document.getElementById('options-container').appendChild(button);
    })
}

function onLoad() {
    const unsub = onSnapshot(collection(db, "Categorias"), (docs) => {
        categorias = []
        docs.docs.map(doc => {
            categorias.push(doc.data())
        })
        createButtons()
    })
    const unsubscribe = onSnapshot(collection(db, "Alunos"), (docs) => {
        alunos = []
        docs.docs.map(doc => {
            alunos.push(doc.data())
        })
    })
}

function showRegistered() {
    alert("Aperte F12 para abrir o console e ver a lista.")
    alunos.map(item => {
        console.log(`${item.NomeCompleto} (${item.Turma}) ==> ${item.CategoriaEscolhida}`)
    })
}

document.querySelector(".confirm-button").addEventListener("click", () => {
    saveResponse()
})

document.querySelector(".view-registrations-button").addEventListener("click", () => {
    showRegistered()
})
onLoad()