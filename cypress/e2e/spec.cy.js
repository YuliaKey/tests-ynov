describe('Home page spec', () => {
  beforeEach(() => {
    // Vider le localStorage avant chaque test
    cy.clearLocalStorage()
  })

  it('should display 0 users when no users are registered', () => {
    // Mock API response avec 0 utilisateurs
    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: []
    }).as('getUsers')

    cy.visit('/')
    cy.wait('@getUsers')
    cy.contains('0 utilisateur(s) inscrit(s)')
  })

  it('should display 2 users when 2 users are registered', () => {
    // Mock API response avec 2 utilisateurs
    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-01',
          postalCode: '75001',
          city: 'Paris'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          birthDate: '1992-05-15',
          postalCode: '69001',
          city: 'Lyon'
        }
      ]
    }).as('getUsers')
    
    cy.visit('/')
    cy.wait('@getUsers')
    
    // Valider l'affichage
    cy.contains('2 utilisateur(s) inscrit(s)')
  })

  it('should navigate to registration form', () => {
    // Mock API response
    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: []
    }).as('getUsers')

    cy.visit('/')
    cy.wait('@getUsers')
    cy.contains("S'inscrire").click()
    cy.url().should('include', '/register')
    cy.contains("Formulaire d'Inscription")
  })
})
