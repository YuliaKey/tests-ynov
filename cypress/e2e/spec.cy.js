describe('Home page spec', () => {
  beforeEach(() => {
    // Vider le localStorage avant chaque test
    cy.clearLocalStorage()
  })

  it('should display 0 users when no users are registered', () => {
    cy.visit('/')
    cy.contains('0 utilisateur(s) inscrit(s)')
  })

  it('should display 1 user when 1 user is registered', () => {
    // Créer un utilisateur dans le localStorage
    cy.visit('/')
    cy.window().then((win) => {
      const users = [{
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        birthDate: '1990-01-01',
        postalCode: '75001',
        city: 'Paris'
      }]
      win.localStorage.setItem('users', JSON.stringify(users))
    })
    
    // Recharger la page pour voir le changement
    cy.reload()
    
    // Valider l'affichage
    cy.contains('1 utilisateur(s) inscrit(s)')
    cy.contains('Liste des inscrits')
    cy.contains('John')
    cy.contains('Doe')
  })

  it('should navigate to registration form', () => {
    cy.visit('/')
    cy.contains("S'inscrire").click()
    cy.url().should('include', '/register')
    cy.contains("Formulaire d'Inscription")
  })
})
