import Knex from 'knex';

export async function up(knex: Knex){
    //criar tabela
    return knex.schema.createTable('point-items', table => {
        table.increments('id').primary();
        table.integer('point_id').notNullable().references('id').inTable('points');
        table.integer('items_id').notNullable().references('id').inTable('items');;
    })
}

export async function down(knex: Knex){
    //voltar atrás (deletear tabela)
    return knex.schema.dropTable('items');
}

