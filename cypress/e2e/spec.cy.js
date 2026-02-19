describe('Home page spec', () => {
  it('deployed react app to localhost', () => {
    cy.visit('/')
    cy.contains('1 user(s) already registered')
  })
})
