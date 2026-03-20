const API = 'http://localhost:8000'

function deleteAllUsers() {
  cy.request('GET', `${API}/users`).then(res => {
    res.body.utilisateurs.forEach(user => {
      cy.request('DELETE', `${API}/users/${user[0]}`)
    })
  })
}

describe('Navigation E2E Tests', () => {
  after(() => {
    deleteAllUsers()
    cy.request('POST', `${API}/users`, { name: 'Alice', email: 'alice@test.com' })
    cy.request('POST', `${API}/users`, { name: 'Bob', email: 'bob@test.com' })
  })

  describe('Scénario Nominal', () => {
    it('should navigate, add user, and update home page', () => {
      deleteAllUsers()

      cy.visit('/')

      // Vérifier "0 utilisateur inscrit" et liste vide
      cy.contains('0 utilisateur(s) inscrit(s)')
      cy.get('table').should('not.exist')
      cy.contains('Liste des inscrits').should('not.exist')

      // Clic/Navigation vers le Formulaire (/register)
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')
      cy.contains("Formulaire d'Inscription")

      // Ajout d'un nouvel utilisateur valide
      cy.get('#firstName').type('Marie')
      cy.get('#lastName').type('Dupont')
      cy.get('#email').type('marie.dupont@example.com')

      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 25)
      cy.get('#birthDate').type(validDate.toISOString().split('T')[0])

      cy.get('#postalCode').type('75001')
      cy.get('#city').type('Paris')

      // Soumettre le formulaire
      cy.get('[data-cy="submit-button"]').should('not.be.disabled')
      cy.get('[data-cy="submit-button"]').click()

      // Vérifier le message de succès
      cy.get('[data-cy="success-toaster"]').should('be.visible')
      cy.get('[data-cy="success-toaster"]').should('contain', 'Inscription réussie')

      // Redirection vers l'Accueil
      cy.url().should('not.include', '/register')

      // Vérifier "1 utilisateur inscrit"
      cy.contains('1 utilisateur(s) inscrit(s)')

      // Vérifier la présence du nouvel utilisateur dans la liste
      cy.contains('Liste des inscrits').should('be.visible')
      cy.get('table').should('be.visible')
      cy.get('table').contains('Marie Dupont')
      cy.get('table').contains('marie.dupont@example.com')
    })

    it('should add multiple users consecutively (0→1→2→3)', () => {
      deleteAllUsers()

      cy.visit('/')
      cy.contains('0 utilisateur(s) inscrit(s)')
      cy.get('table').should('not.exist')

      // Ajouter premier utilisateur
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Marie')
      cy.get('#lastName').type('Dupont')
      cy.get('#email').type('marie.dupont@example.com')

      const validDate1 = new Date()
      validDate1.setFullYear(validDate1.getFullYear() - 25)
      cy.get('#birthDate').type(validDate1.toISOString().split('T')[0])

      cy.get('#postalCode').type('75001')
      cy.get('#city').type('Paris')
      cy.get('[data-cy="submit-button"]').click()

      cy.get('[data-cy="success-toaster"]').should('be.visible')
      cy.url().should('not.include', '/register')
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.get('table tbody tr').should('have.length', 1)

      // Ajouter deuxième utilisateur
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Jean')
      cy.get('#lastName').type('Martin')
      cy.get('#email').type('jean.martin@example.com')

      const validDate2 = new Date()
      validDate2.setFullYear(validDate2.getFullYear() - 30)
      cy.get('#birthDate').type(validDate2.toISOString().split('T')[0])

      cy.get('#postalCode').type('69001')
      cy.get('#city').type('Lyon')
      cy.get('[data-cy="submit-button"]').click()

      cy.get('[data-cy="success-toaster"]').should('be.visible')
      cy.url().should('not.include', '/register')
      cy.contains('2 utilisateur(s) inscrit(s)')
      cy.get('table tbody tr').should('have.length', 2)
      cy.get('table').contains('Marie Dupont')
      cy.get('table').contains('Jean Martin')

      // Ajouter troisième utilisateur
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Sophie')
      cy.get('#lastName').type('Bernard')
      cy.get('#email').type('sophie.bernard@example.com')

      const validDate3 = new Date()
      validDate3.setFullYear(validDate3.getFullYear() - 22)
      cy.get('#birthDate').type(validDate3.toISOString().split('T')[0])

      cy.get('#postalCode').type('13001')
      cy.get('#city').type('Marseille')
      cy.get('[data-cy="submit-button"]').click()

      cy.get('[data-cy="success-toaster"]').should('be.visible')
      cy.url().should('not.include', '/register')
      cy.contains('3 utilisateur(s) inscrit(s)')
      cy.get('table tbody tr').should('have.length', 3)
      cy.get('table').contains('Marie Dupont')
      cy.get('table').contains('Jean Martin')
      cy.get('table').contains('Sophie Bernard')
    })

    it('should persist users after page reload', () => {
      deleteAllUsers()
      cy.request('POST', `${API}/users`, { name: 'Paul Durand', email: 'paul.durand@example.com' })

      cy.visit('/')
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.get('table').contains('Paul Durand')

      // Rafraîchir la page
      cy.reload()

      // Les données doivent toujours être présentes
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.get('table').should('be.visible')
      cy.get('table').contains('Paul Durand')
      cy.get('table').contains('paul.durand@example.com')
    })
  })

  describe('Scénario d\'Erreur', () => {
    beforeEach(() => {
      deleteAllUsers()
      cy.request('POST', `${API}/users`, { name: 'Marie Dupont', email: 'marie.dupont@example.com' })
      cy.visit('/')
    })

    it('should handle validation errors and keep user count unchanged', () => {
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.contains('Liste des inscrits').should('be.visible')
      cy.get('table').contains('Marie Dupont')

      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      // Tentative d'ajout invalide - champs vides
      cy.get('[data-cy="submit-button"]').should('be.disabled')

      cy.get('#firstName').type('John123')
      cy.get('#firstName').blur()

      cy.get('[data-cy="firstName-error"]').should('be.visible')
      cy.get('[data-cy="firstName-error"]').should('contain', 'cannot contain numbers')
      cy.get('[data-cy="submit-button"]').should('be.disabled')

      // Retour vers l'Accueil
      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')

      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.contains('Liste des inscrits').should('be.visible')
      cy.get('table tbody tr').should('have.length', 1)
      cy.get('table').contains('Marie Dupont')
      cy.get('table').contains('marie.dupont@example.com')
    })

    it('should show error for invalid email format', () => {
      cy.contains('1 utilisateur(s) inscrit(s)')

      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Jean')
      cy.get('#lastName').type('Martin')
      cy.get('#email').type('invalidemail')
      cy.get('#email').blur()

      cy.get('[data-cy="email-error"]').should('be.visible')
      cy.get('[data-cy="email-error"]').should('contain', 'Email format is invalid')
      cy.get('[data-cy="submit-button"]').should('be.disabled')

      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should show error for invalid postal code format', () => {
      cy.contains('1 utilisateur(s) inscrit(s)')

      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Jean')
      cy.get('#lastName').type('Martin')
      cy.get('#email').type('jean.martin@example.com')

      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 30)
      cy.get('#birthDate').type(validDate.toISOString().split('T')[0])

      cy.get('#postalCode').type('1234')
      cy.get('#postalCode').blur()

      cy.get('[data-cy="postalCode-error"]').should('be.visible')
      cy.get('[data-cy="postalCode-error"]').should('contain', 'must be exactly 5 digits')

      cy.get('#city').type('Lyon')
      cy.get('[data-cy="submit-button"]').should('be.disabled')

      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should show error for underage user', () => {
      cy.contains('1 utilisateur(s) inscrit(s)')

      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Sophie')
      cy.get('#lastName').type('Jeune')
      cy.get('#email').type('sophie.jeune@example.com')

      const underageDate = new Date()
      underageDate.setFullYear(underageDate.getFullYear() - 15)
      cy.get('#birthDate').type(underageDate.toISOString().split('T')[0])
      cy.get('#birthDate').blur()

      cy.get('[data-cy="birthDate-error"]').should('be.visible')
      cy.get('[data-cy="birthDate-error"]').should('contain', 'must be at least 18 years old')

      cy.get('#postalCode').type('69001')
      cy.get('#city').type('Lyon')
      cy.get('[data-cy="submit-button"]').should('be.disabled')

      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should show error for lastName with numbers', () => {
      cy.contains('1 utilisateur(s) inscrit(s)')

      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Marie')
      cy.get('#lastName').type('Dupont123')
      cy.get('#lastName').blur()

      cy.get('[data-cy="lastName-error"]').should('be.visible')
      cy.get('[data-cy="lastName-error"]').should('contain', 'cannot contain numbers')
      cy.get('[data-cy="submit-button"]').should('be.disabled')

      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should show error for city with numbers', () => {
      cy.contains('1 utilisateur(s) inscrit(s)')

      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Paul')
      cy.get('#lastName').type('Durand')
      cy.get('#email').type('paul.durand@example.com')

      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 25)
      cy.get('#birthDate').type(validDate.toISOString().split('T')[0])

      cy.get('#postalCode').type('75001')
      cy.get('#city').type('Paris123')
      cy.get('#city').blur()

      cy.get('[data-cy="city-error"]').should('be.visible')
      cy.get('[data-cy="city-error"]').should('contain', 'cannot contain numbers')
      cy.get('[data-cy="submit-button"]').should('be.disabled')

      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should handle duplicate email validation', () => {
      cy.contains('1 utilisateur(s) inscrit(s)')

      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')

      cy.get('#firstName').type('Jean')
      cy.get('#lastName').type('Martin')
      cy.get('#email').type('marie.dupont@example.com')
      cy.get('#email').blur()

      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 30)
      cy.get('#birthDate').type(validDate.toISOString().split('T')[0])

      cy.get('#postalCode').type('69001')
      cy.get('#city').type('Lyon')

      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.get('table tbody tr').should('have.length', 1)
    })
  })
})
