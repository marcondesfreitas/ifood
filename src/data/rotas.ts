/**
 * Ofertas de rota simuladas.
 *
 * Mesmo princípio de `avisos.ts`: dado fica em arquivo de dados, tela só
 * renderiza. Quando existir um backend, troca-se a origem desta lista por um
 * fetch — nenhuma tela precisa mudar.
 */

export type Rota = {
  id: string;
  /** Bairro da coleta, como aparece no cartão da esquerda. */
  bairroColeta: string;
  /** Bairro da entrega, cartão da direita. */
  bairroEntrega: string;
  /** Nome do estabelecimento. */
  restaurante: string;
  /** Endereço do cliente. */
  enderecoEntrega: string;
  valor: number;
  veiculo: 'Moto' | 'Bicicleta' | 'Carro';
  distancia: string;
  tempo: string;
  devolucao: boolean;
};

export const ROTAS: Omit<Rota, 'id'>[] = [
  {
    bairroColeta: 'Aldeota',
    bairroEntrega: 'Meireles',
    restaurante: "McDonald's",
    enderecoEntrega: 'Rua Ana Bilhar',
    valor: 18.9,
    veiculo: 'Moto',
    distancia: '3,4 km',
    tempo: '18 min',
    devolucao: true,
  },
  {
    bairroColeta: 'Centro',
    bairroEntrega: 'Benfica',
    restaurante: 'Habib’s',
    enderecoEntrega: 'Av. Carapinima',
    valor: 12.5,
    veiculo: 'Moto',
    distancia: '2,1 km',
    tempo: '11 min',
    devolucao: false,
  },
  {
    bairroColeta: 'Papicu',
    bairroEntrega: 'Cocó',
    restaurante: 'Coco Bambu',
    enderecoEntrega: 'Av. Santos Dumont',
    valor: 26.4,
    veiculo: 'Moto',
    distancia: '5,8 km',
    tempo: '24 min',
    devolucao: true,
  },
  {
    bairroColeta: 'Montese',
    bairroEntrega: 'Parangaba',
    restaurante: 'Pizza Hut',
    enderecoEntrega: 'Rua Urbano Santos',
    valor: 9.8,
    veiculo: 'Moto',
    distancia: '1,9 km',
    tempo: '9 min',
    devolucao: false,
  },
];

/** Segundos que o entregador tem para responder a uma oferta. */
export const SEGUNDOS_OFERTA = 60;
