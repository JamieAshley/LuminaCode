'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async () => {
    // On récupère data et error
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      // On utilise data ici, l'avertissement jaune va disparaître
      console.log("Utilisateur créé :", data)
      alert("Succès ! Un mail de confirmation a été envoyé à " + email)
    }
  }

  return (
    <div style={{ padding: '40px', color: 'white', background: '#111', height: '100vh' }}>
      <h1>Inscription LuminaCode</h1>
      <input 
        type="email" 
        placeholder="Email" 
        onChange={(e) => setEmail(e.target.value)} 
        style={{ display: 'block', margin: '10px 0', padding: '8px', color: 'black' }}
      />
      <input 
        type="password" 
        placeholder="Mot de passe" 
        onChange={(e) => setPassword(e.target.value)} 
        style={{ display: 'block', margin: '10px 0', padding: '8px', color: 'black' }}
      />
      <button onClick={handleSignUp} style={{ padding: '10px 20px', background: '#3ecf8e', border: 'none', cursor: 'pointer' }}>
        Créer mon compte
      </button>
    </div>
  )
}