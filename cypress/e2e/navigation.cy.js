describe('Navigation E2E Tests', () => {
  beforeEach(() => {
    // Vider le localStorage avant chaque test
    cy.clearLocalStorage()
  })

  describe('Scénario Nominal', () => {
    it('should navigate, add user, and update home page', () => {
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
      
      // Date de naissance valide (25 ans)
      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 25)
      const dateString = validDate.toISOString().split('T')[0]
      cy.get('#birthDate').type(dateString)
      
      cy.get('#postalCode').type('75001')
      cy.get('#city').type('Paris')
      
      // Soumettre le formulaire
      cy.get('[data-cy="submit-button"]').should('not.be.disabled')
      cy.get('[data-cy="submit-button"]').click()
      
      // Vérifier le message de succès
      cy.get('[data-cy="success-toaster"]').should('be.visible')
      cy.get('[data-cy="success-toaster"]').should('contain', 'Inscription réussie')
      
      // Redirection ou Navigation vers l'Accueil
      cy.url().should('not.include', '/register')
      
      // Vérifier "1 utilisateur inscrit"
      cy.contains('1 utilisateur(s) inscrit(s)')
      
      // Vérifier la présence du nouvel utilisateur dans la liste
      cy.contains('Liste des inscrits').should('be.visible')
      cy.get('table').should('be.visible')
      cy.get('table').contains('Marie')
      cy.get('table').contains('Dupont')
      cy.get('table').contains('marie.dupont@example.com')
      cy.get('table').contains('Paris')
    })

    it('should add multiple users consecutively (0→1→2→3)', () => {
      cy.visit('/')
      
      // Vérifier état initial: 0 utilisateur
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
      
      // Vérifier 1 utilisateur
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
      
      // Vérifier 2 utilisateurs
      cy.url().should('not.include', '/register')
      cy.contains('2 utilisateur(s) inscrit(s)')
      cy.get('table tbody tr').should('have.length', 2)
      cy.get('table').contains('Marie')
      cy.get('table').contains('Jean')
      
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
      
      // Vérifier 3 utilisateurs
      cy.url().should('not.include', '/register')
      cy.contains('3 utilisateur(s) inscrit(s)')
      cy.get('table tbody tr').should('have.length', 3)
      cy.get('table').contains('Marie')
      cy.get('table').contains('Jean')
      cy.get('table').contains('Sophie')
    })

    it('should persist users in localStorage after page reload', () => {
      cy.visit('/')
      
      // Ajouter un utilisateur
      cy.contains("S'inscrire").click()
      
      cy.get('#firstName').type('Paul')
      cy.get('#lastName').type('Durand')
      cy.get('#email').type('paul.durand@example.com')
      
      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 28)
      cy.get('#birthDate').type(validDate.toISOString().split('T')[0])
      
      cy.get('#postalCode').type('44000')
      cy.get('#city').type('Nantes')
      cy.get('[data-cy="submit-button"]').click()
      
      // Vérifier 1 utilisateur
      cy.url().should('not.include', '/register')
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.get('table').contains('Paul')
      cy.get('table').contains('Durand')
      
      // Rafraîchir la page
      cy.reload()
      
      // Vérifier que les données persistent
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.get('table').should('be.visible')
      cy.get('table').contains('Paul')
      cy.get('table').contains('Durand')
      cy.get('table').contains('paul.durand@example.com')
      cy.get('table').contains('Nantes')
      
      // Vérifier que le localStorage contient bien les données
      cy.window().then((win) => {
        const users = JSON.parse(win.localStorage.getItem('users'))
        expect(users).to.have.length(1)
        expect(users[0].firstName).to.equal('Paul')
        expect(users[0].lastName).to.equal('Durand')
        expect(users[0].email).to.equal('paul.durand@example.com')
        expect(users[0].city).to.equal('Nantes')
      })
    })
  })

  describe('Scénario d\'Erreur', () => {
    beforeEach(() => {
      // Créer un utilisateur existant dans le localStorage
      cy.visit('/')
      cy.window().then((win) => {
        const users = [{
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie.dupont@example.com',
          birthDate: '1999-01-01',
          postalCode: '75001',
          city: 'Paris'
        }]
        win.localStorage.setItem('users', JSON.stringify(users))
      })
      cy.reload()
    })

    it('should handle validation errors and keep user count unchanged', () => {
      // Vérifier l'état initial (1 inscrit)
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.contains('Liste des inscrits').should('be.visible')
      cy.get('table').contains('Marie')
      
      // Navigation vers le Formulaire
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')
      
      // Tentative d'ajout invalide - champs vides
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Remplir avec des données invalides
      cy.get('#firstName').type('John123') 
      cy.get('#firstName').blur()
      
      // Vérifier l'erreur affichée
      cy.get('[data-cy="firstName-error"]').should('be.visible')
      cy.get('[data-cy="firstName-error"]').should('contain', 'cannot contain numbers')
      
      // Le bouton reste désactivé
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Retour vers l'Accueil
      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      
      // Vérifier "Toujours 1 utilisateur inscrit"
      cy.contains('1 utilisateur(s) inscrit(s)')
      
      // Vérifier que la liste est inchangée
      cy.contains('Liste des inscrits').should('be.visible')
      cy.get('table tbody tr').should('have.length', 1)
      cy.get('table').contains('Marie')
      cy.get('table').contains('Dupont')
      cy.get('table').contains('marie.dupont@example.com')
    })

    it('should show error for invalid email format', () => {
      // Vérifier l'état initial (1 inscrit)
      cy.contains('1 utilisateur(s) inscrit(s)')
      
      // Navigation vers le Formulaire
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')
      
      // Remplir avec un email invalide
      cy.get('#firstName').type('Jean')
      cy.get('#lastName').type('Martin')
      cy.get('#email').type('invalidemail')
      cy.get('#email').blur()
      
      // Vérifier l'erreur email
      cy.get('[data-cy="email-error"]').should('be.visible')
      cy.get('[data-cy="email-error"]').should('contain', 'Email format is invalid')
      
      // Le bouton reste désactivé
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Retour vers l'Accueil
      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      
      // Vérifier que le compte n'a pas changé
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should show error for invalid postal code format', () => {
      // Vérifier l'état initial (1 inscrit)
      cy.contains('1 utilisateur(s) inscrit(s)')
      
      // Navigation vers le Formulaire
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')
      
      // Remplir avec un code postal invalide
      cy.get('#firstName').type('Jean')
      cy.get('#lastName').type('Martin')
      cy.get('#email').type('jean.martin@example.com')
      
      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 30)
      cy.get('#birthDate').type(validDate.toISOString().split('T')[0])
      
      cy.get('#postalCode').type('1234') 
      cy.get('#postalCode').blur()
      
      // Vérifier l'erreur code postal
      cy.get('[data-cy="postalCode-error"]').should('be.visible')
      cy.get('[data-cy="postalCode-error"]').should('contain', 'must be exactly 5 digits')
      
      cy.get('#city').type('Lyon')
      
      // Le bouton reste désactivé
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Retour vers l'Accueil
      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      
      // Vérifier que le compte n'a pas changé
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should show error for underage user', () => {
      // Vérifier l'état initial (1 inscrit)
      cy.contains('1 utilisateur(s) inscrit(s)')
      
      // Navigation vers le Formulaire
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')
      
      // Remplir avec une date de naissance mineur (< 18 ans)
      cy.get('#firstName').type('Sophie')
      cy.get('#lastName').type('Jeune')
      cy.get('#email').type('sophie.jeune@example.com')
      
      const underageDate = new Date()
      underageDate.setFullYear(underageDate.getFullYear() - 15) 
      cy.get('#birthDate').type(underageDate.toISOString().split('T')[0])
      cy.get('#birthDate').blur()
      
      // Vérifier l'erreur date de naissance
      cy.get('[data-cy="birthDate-error"]').should('be.visible')
      cy.get('[data-cy="birthDate-error"]').should('contain', 'must be at least 18 years old')
      
      cy.get('#postalCode').type('69001')
      cy.get('#city').type('Lyon')
      
      // Le bouton reste désactivé
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Retour vers l'Accueil
      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      
      // Vérifier que le compte n'a pas changé
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should show error for lastName with numbers', () => {
      // Vérifier l'état initial (1 inscrit)
      cy.contains('1 utilisateur(s) inscrit(s)')
      
      // Navigation vers le Formulaire
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')
      
      // Remplir avec un nom contenant des chiffres
      cy.get('#firstName').type('Marie')
      cy.get('#lastName').type('Dupont123')
      cy.get('#lastName').blur()
      
      // Vérifier l'erreur nom
      cy.get('[data-cy="lastName-error"]').should('be.visible')
      cy.get('[data-cy="lastName-error"]').should('contain', 'cannot contain numbers')
      
      // Le bouton reste désactivé
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Retour vers l'Accueil
      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      
      // Vérifier que le compte n'a pas changé
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should show error for city with numbers', () => {
      // Vérifier l'état initial (1 inscrit)
      cy.contains('1 utilisateur(s) inscrit(s)')
      
      // Navigation vers le Formulaire
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')
      
      // Remplir avec une ville contenant des chiffres
      cy.get('#firstName').type('Paul')
      cy.get('#lastName').type('Durand')
      cy.get('#email').type('paul.durand@example.com')
      
      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 25)
      cy.get('#birthDate').type(validDate.toISOString().split('T')[0])
      
      cy.get('#postalCode').type('75001')
      cy.get('#city').type('Paris123')
      cy.get('#city').blur()
      
      // Vérifier l'erreur ville
      cy.get('[data-cy="city-error"]').should('be.visible')
      cy.get('[data-cy="city-error"]').should('contain', 'cannot contain numbers')
      
      // Le bouton reste désactivé
      cy.get('[data-cy="submit-button"]').should('be.disabled')
      
      // Retour vers l'Accueil
      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      
      // Vérifier que le compte n'a pas changé
      cy.contains('1 utilisateur(s) inscrit(s)')
    })

    it('should handle duplicate email validation', () => {
      // Vérifier l'état initial (1 inscrit)
      cy.contains('1 utilisateur(s) inscrit(s)')
      
      // Navigation vers le Formulaire
      cy.contains("S'inscrire").click()
      cy.url().should('include', '/register')
      
      // Tentative d'ajout avec email déjà pris
      cy.get('#firstName').type('Jean')
      cy.get('#lastName').type('Martin')
      cy.get('#email').type('marie.dupont@example.com') 
      cy.get('#email').blur()
      
      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 30)
      cy.get('#birthDate').type(validDate.toISOString().split('T')[0])
      
      cy.get('#postalCode').type('69001')
      cy.get('#city').type('Lyon')
      
      // Retour vers l'Accueil sans soumettre
      cy.contains('Retour à l\'accueil').click()
      cy.url().should('not.include', '/register')
      
      // Vérifier que le compte n'a pas changé
      cy.contains('1 utilisateur(s) inscrit(s)')
      cy.get('table tbody tr').should('have.length', 1)
    })
  })
})
