let beltCost = [
  {
    name: 'IRON',
    total: 1
  }
];
const buildingCost = {
  BELT: beltCost,
  IMPORT: beltCost,
  EXPORT: beltCost,
  MOVER: [
    {
      name: 'COPPER',
      total: 2
    },
    {
      name: 'IRON',
      total: 2
    }
  ],
  REPAIRER: [
    {
      name: 'IRON',
      total: 50
    },
    {
      name: 'COPPER',
      total: 50
    }
  ],
  EXTRACTOR: [
    {
      name: 'COPPER',
      total: 20
    },
    {
      name: 'IRON',
      total: 20
    }
  ],
  MINER: [
    {
      name: 'IRON',
      total: 10
    }
  ],
  ASSEMBLER: [
    {
      name: 'COPPER',
      total: 50
    },
    {
      name: 'IRON',
      total: 50
    }
  ]
};
export default buildingCost;