const API = 'http://localhost:8000'

function deleteAllUsers() {
  cy.request('GET', `${API}/users`).then(res => {
    res.body.utilisateurs.forEach(user => {
      cy.request('DELETE', `${API}/users/${user[0]}`)
    })
  })
}

describe('Home page spec', () => {
  after(() => {
    // Restaurer utilisateurs après tous les tests
    deleteAllUsers()
    cy.request('POST', `${API}/users`, { name: 'Alice', email: 'alice@test.com' })
    cy.request('POST', `${API}/users`, { name: 'Bob', email: 'bob@test.com' })
  })

  it('should display 0 users when no users are registered', () => {
    deleteAllUsers()
    cy.visit('/')
    cy.contains('0 utilisateur(s) inscrit(s)')
    cy.get('table').should('not.exist')
  })

  it('should display 2 users when 2 users are registered', () => {
    deleteAllUsers()
    cy.request('POST', `${API}/users`, { name: 'John Doe', email: 'john@example.com' })
    cy.request('POST', `${API}/users`, { name: 'Jane Smith', email: 'jane@example.com' })

    cy.visit('/')
    cy.contains('2 utilisateur(s) inscrit(s)')
    cy.get('table').contains('John Doe')
    cy.get('table').contains('jane@example.com')
  })

  it('should navigate to registration form', () => {
    cy.visit('/')
    cy.contains("S'inscrire").click()
    cy.url().should('include', '/register')
    cy.contains("Formulaire d'Inscription")
  })
})
