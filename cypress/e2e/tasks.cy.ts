describe('managing tasks', () => {
  beforeEach(() => {
    cy.visit('/session/new')
    cy.contains('input', 'Try the demo account').click()
    cy.get('.tabs').should('be.visible')
  })

  it('creates, edits, completes, filters and deletes a task', () => {
    const title = `Water the plants ${Date.now()}`
    const renamed = `${title} on the balcony`

    cy.get('.composer__title').type(title)
    cy.contains('label', 'High').click()
    cy.contains('button', 'Add task').click()
    cy.contains('.task', title).should('contain', 'High priority')

    cy.contains('.task__title', title).click()
    cy.get('.task__edit input').first().clear().type(renamed)
    cy.contains('button', 'Save changes').click()
    cy.contains('.task__title', renamed).should('exist')

    cy.contains('.task', renamed).find('.task__check').check()
    cy.contains('.task__title', renamed).should('not.exist')

    cy.contains('.tab', 'Done').click()
    cy.location('search').should('eq', '?status=completed')
    cy.contains('.task', renamed).should('exist')

    cy.contains('.task', renamed).find('.task__delete').click()
    cy.contains('.task', renamed).contains('Really delete?').click()
    cy.contains('.task__title', renamed).should('not.exist')
  })

  it("does not allow a blank task", () => {
    cy.get('.composer__title').type('   ')
    cy.contains('button', 'Add task').should('be.disabled')
  })
})
