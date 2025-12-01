/**
 * Utilitário para mapeamento de dados entre diferentes formatos
 * Converte os campos do request para o formato do banco de dados
 */

/**
 * Mapeia o pedido do formato de entrada para o formato do banco
 * @param {Object} inputOrder - Pedido no formato de entrada
 * @returns {Object} Pedido no formato do banco de dados
 */
const mapInputToDatabase = (inputOrder) => {
  return {
    orderId: inputOrder.numeroPedido,
    value: parseFloat(inputOrder.valorTotal),
    creationDate: new Date(inputOrder.dataCriacao),
    items: inputOrder.items.map(item => ({
      productId: parseInt(item.idItem),
      quantity: parseInt(item.quantidadeItem),
      price: parseFloat(item.valorItem)
    }))
  };
};

/**
 * Mapeia o pedido do formato do banco para o formato de saída
 * @param {Object} dbOrder - Pedido no formato do banco
 * @param {Array} dbItems - Itens do pedido
 * @returns {Object} Pedido no formato de saída
 */
const mapDatabaseToOutput = (dbOrder, dbItems = []) => {
  return {
    orderId: dbOrder.order_id,
    value: parseFloat(dbOrder.value),
    creationDate: dbOrder.creation_date,
    items: dbItems.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: parseFloat(item.price)
    }))
  };
};

module.exports = {
  mapInputToDatabase,
  mapDatabaseToOutput
};