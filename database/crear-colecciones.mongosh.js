// Ejecutar sobre una base nueva seleccionada con use taller_bicicletas.
// Los índices completos se instalan con npm run db:init.
const schemas = {
  "usuarios": {
    "bsonType": "object",
    "required": [
      "nombreCompleto",
      "documento",
      "correo",
      "telefono",
      "rol",
      "tokenHash"
    ],
    "properties": {
      "nombreCompleto": {
        "bsonType": "string",
        "minLength": 1
      },
      "documento": {
        "bsonType": "string",
        "minLength": 1
      },
      "correo": {
        "bsonType": "string",
        "minLength": 1
      },
      "telefono": {
        "bsonType": "string",
        "minLength": 1
      },
      "rol": {
        "bsonType": "string",
        "enum": [
          "cliente",
          "tecnico",
          "coordinador"
        ]
      },
      "direccion": {
        "bsonType": "string",
        "minLength": 1
      },
      "tokenHash": {
        "bsonType": "string",
        "minLength": 1
      }
    }
  },
  "bicicletas": {
    "bsonType": "object",
    "required": [
      "propietarioId",
      "marca",
      "modelo",
      "tipo",
      "color",
      "caracteristicas"
    ],
    "properties": {
      "propietarioId": {
        "bsonType": "objectId"
      },
      "marca": {
        "bsonType": "string",
        "minLength": 1
      },
      "modelo": {
        "bsonType": "string",
        "minLength": 1
      },
      "tipo": {
        "bsonType": "string",
        "enum": [
          "urbana",
          "ruta",
          "montana",
          "electrica"
        ]
      },
      "color": {
        "bsonType": "string",
        "minLength": 1
      },
      "numeroSerie": {
        "bsonType": "string",
        "minLength": 1
      },
      "caracteristicas": {
        "bsonType": "object",
        "properties": {
          "tamanoMarco": {
            "bsonType": "string",
            "minLength": 1
          },
          "material": {
            "bsonType": "string",
            "minLength": 1
          },
          "tamanoRueda": {
            "bsonType": "string",
            "minLength": 1
          },
          "tipoFrenos": {
            "bsonType": "string",
            "minLength": 1
          },
          "transmision": {
            "bsonType": "string",
            "minLength": 1
          },
          "suspension": {
            "bsonType": "object",
            "required": [
              "informacion",
              "recorrido"
            ],
            "properties": {
              "informacion": {
                "bsonType": "string",
                "minLength": 1
              },
              "recorrido": {
                "bsonType": [
                  "int",
                  "long",
                  "double",
                  "decimal"
                ],
                "minimum": 0
              }
            }
          },
          "bateria": {
            "bsonType": "object",
            "required": [
              "capacidadWh",
              "voltajeV"
            ],
            "properties": {
              "capacidadWh": {
                "bsonType": [
                  "int",
                  "long",
                  "double",
                  "decimal"
                ],
                "minimum": 0
              },
              "voltajeV": {
                "bsonType": [
                  "int",
                  "long",
                  "double",
                  "decimal"
                ],
                "minimum": 0
              }
            }
          },
          "motor": {
            "bsonType": "object",
            "required": [
              "tipo",
              "potenciaW"
            ],
            "properties": {
              "tipo": {
                "bsonType": "string",
                "minLength": 1
              },
              "potenciaW": {
                "bsonType": [
                  "int",
                  "long",
                  "double",
                  "decimal"
                ],
                "minimum": 0
              }
            }
          }
        }
      }
    }
  },
  "servicios": {
    "bsonType": "object",
    "required": [
      "nombre",
      "categoria",
      "descripcion",
      "duracionEstimada",
      "precioReferencia",
      "tareasHabituales",
      "recomendacionesGenerales"
    ],
    "properties": {
      "nombre": {
        "bsonType": "string",
        "minLength": 1
      },
      "categoria": {
        "bsonType": "string",
        "enum": [
          "mantenimiento preventivo",
          "frenos",
          "transmision",
          "ruedas",
          "suspension",
          "componentes electricos"
        ]
      },
      "descripcion": {
        "bsonType": "string",
        "minLength": 1
      },
      "duracionEstimada": {
        "bsonType": [
          "int",
          "long",
          "double",
          "decimal"
        ],
        "minimum": 0
      },
      "precioReferencia": {
        "bsonType": [
          "int",
          "long",
          "double",
          "decimal"
        ],
        "minimum": 0
      },
      "tareasHabituales": {
        "bsonType": "array",
        "items": {
          "bsonType": "object",
          "required": [
            "nombre",
            "descripcion"
          ],
          "properties": {
            "nombre": {
              "bsonType": "string",
              "minLength": 1
            },
            "descripcion": {
              "bsonType": "string",
              "minLength": 1
            }
          }
        }
      },
      "recomendacionesGenerales": {
        "bsonType": "array",
        "items": {
          "bsonType": "string",
          "minLength": 1
        }
      }
    }
  },
  "repuestos": {
    "bsonType": "object",
    "required": [
      "nombre",
      "especificaciones",
      "precio"
    ],
    "properties": {
      "nombre": {
        "bsonType": "string",
        "minLength": 1
      },
      "especificaciones": {
        "bsonType": "string",
        "minLength": 1
      },
      "precio": {
        "bsonType": [
          "int",
          "long",
          "double",
          "decimal"
        ],
        "minimum": 0
      }
    }
  },
  "citas": {
    "bsonType": "object",
    "required": [
      "clienteId",
      "bicicletaId",
      "fechaHora",
      "motivo",
      "estado",
      "problemasObservados",
      "serviciosInteres"
    ],
    "properties": {
      "clienteId": {
        "bsonType": "objectId"
      },
      "bicicletaId": {
        "bsonType": "objectId"
      },
      "fechaHora": {
        "bsonType": "date"
      },
      "motivo": {
        "bsonType": "string",
        "minLength": 1
      },
      "estado": {
        "bsonType": "string",
        "enum": [
          "solicitada",
          "confirmada",
          "atendida",
          "cancelada"
        ]
      },
      "problemasObservados": {
        "bsonType": "string",
        "minLength": 1
      },
      "serviciosInteres": {
        "bsonType": "array",
        "items": {
          "bsonType": "objectId"
        }
      },
      "observacionCambio": {
        "bsonType": "string",
        "minLength": 1
      }
    }
  },
  "ordenesServicio": {
    "bsonType": "object",
    "required": [
      "clienteId",
      "bicicleta",
      "fechaRecepcion",
      "fechaEstimadaEntrega",
      "coordinadorId",
      "tecnicosAsignados",
      "estado",
      "recepcion",
      "historialEstados",
      "version"
    ],
    "properties": {
      "clienteId": {
        "bsonType": "objectId"
      },
      "bicicleta": {
        "bsonType": "object",
        "required": [
          "bicicletaId",
          "marca",
          "modelo",
          "caracteristicas"
        ],
        "properties": {
          "bicicletaId": {
            "bsonType": "objectId"
          },
          "marca": {
            "bsonType": "string",
            "minLength": 1
          },
          "modelo": {
            "bsonType": "string",
            "minLength": 1
          },
          "caracteristicas": {
            "bsonType": "object"
          }
        }
      },
      "citaId": {
        "bsonType": "objectId"
      },
      "fechaRecepcion": {
        "bsonType": "date"
      },
      "fechaEstimadaEntrega": {
        "bsonType": "date"
      },
      "coordinadorId": {
        "bsonType": "objectId"
      },
      "tecnicosAsignados": {
        "bsonType": "array",
        "items": {
          "bsonType": "objectId"
        }
      },
      "estado": {
        "bsonType": "string",
        "enum": [
          "recibida",
          "en diagnostico",
          "pendiente de autorizacion",
          "en ejecucion",
          "lista para entrega",
          "entregada",
          "cancelada"
        ]
      },
      "recepcion": {
        "bsonType": "object",
        "required": [
          "problemaReportado",
          "condicionesObservadas",
          "accesorios",
          "fotografias"
        ],
        "properties": {
          "problemaReportado": {
            "bsonType": "string",
            "minLength": 1
          },
          "condicionesObservadas": {
            "bsonType": "string",
            "minLength": 1
          },
          "accesorios": {
            "bsonType": "array",
            "items": {
              "bsonType": "string",
              "minLength": 1
            }
          },
          "fotografias": {
            "bsonType": "array",
            "items": {
              "bsonType": "object",
              "required": [
                "nombreArchivo",
                "descripcion",
                "ubicacion"
              ],
              "properties": {
                "nombreArchivo": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "descripcion": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "ubicacion": {
                  "bsonType": "string",
                  "minLength": 1
                }
              }
            }
          }
        }
      },
      "diagnostico": {
        "bsonType": "object",
        "required": [
          "hallazgos",
          "evidencias"
        ],
        "properties": {
          "hallazgos": {
            "bsonType": "array",
            "items": {
              "bsonType": "object",
              "required": [
                "tecnicoId",
                "componente",
                "condicion",
                "descripcion",
                "prioridad",
                "observaciones",
                "accionesRecomendadas"
              ],
              "properties": {
                "tecnicoId": {
                  "bsonType": "objectId"
                },
                "componente": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "condicion": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "descripcion": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "prioridad": {
                  "bsonType": "string",
                  "enum": [
                    "baja",
                    "media",
                    "alta",
                    "critica"
                  ]
                },
                "observaciones": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "accionesRecomendadas": {
                  "bsonType": "array",
                  "items": {
                    "bsonType": "string",
                    "minLength": 1
                  }
                }
              }
            }
          },
          "evidencias": {
            "bsonType": "array",
            "items": {
              "bsonType": "object",
              "required": [
                "nombreArchivo",
                "descripcion",
                "ubicacion"
              ],
              "properties": {
                "nombreArchivo": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "descripcion": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "ubicacion": {
                  "bsonType": "string",
                  "minLength": 1
                }
              }
            }
          }
        }
      },
      "historialEstados": {
        "bsonType": "array",
        "items": {
          "bsonType": "object",
          "required": [
            "estado",
            "fecha",
            "usuarioId",
            "observacion"
          ],
          "properties": {
            "estado": {
              "bsonType": "string",
              "minLength": 1
            },
            "fecha": {
              "bsonType": "date"
            },
            "usuarioId": {
              "bsonType": "objectId"
            },
            "observacion": {
              "bsonType": "string",
              "minLength": 1
            }
          }
        }
      },
      "revisionEntrega": {
        "bsonType": "object",
        "required": [
          "puntosVerificados",
          "resultado",
          "aprobada",
          "recomendaciones"
        ],
        "properties": {
          "puntosVerificados": {
            "bsonType": "array",
            "items": {
              "bsonType": "object",
              "required": [
                "punto",
                "resultado"
              ],
              "properties": {
                "punto": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "resultado": {
                  "bsonType": "string",
                  "minLength": 1
                }
              }
            }
          },
          "resultado": {
            "bsonType": "string",
            "minLength": 1
          },
          "aprobada": {
            "bsonType": "bool"
          },
          "recomendaciones": {
            "bsonType": "array",
            "items": {
              "bsonType": "string",
              "minLength": 1
            }
          }
        }
      },
      "entrega": {
        "bsonType": "object",
        "required": [
          "fecha",
          "confirmacionRecepcionCliente"
        ],
        "properties": {
          "fecha": {
            "bsonType": "date"
          },
          "confirmacionRecepcionCliente": {
            "bsonType": "bool"
          }
        }
      },
      "valoracionServicio": {
        "bsonType": "object",
        "required": [
          "calificacion",
          "comentarios",
          "sugerencias"
        ],
        "properties": {
          "calificacion": {
            "bsonType": [
              "int",
              "double"
            ],
            "minimum": 1,
            "maximum": 5
          },
          "comentarios": {
            "bsonType": "string",
            "minLength": 1
          },
          "sugerencias": {
            "bsonType": "string",
            "minLength": 1
          }
        }
      },
      "version": {
        "bsonType": [
          "int",
          "long",
          "double",
          "decimal"
        ],
        "minimum": 0
      }
    }
  },
  "trabajosOrden": {
    "bsonType": "object",
    "required": [
      "ordenId",
      "descripcionIntervencion",
      "componente",
      "manoObraEstimada",
      "repuestosPrevistos",
      "observaciones",
      "autorizacion"
    ],
    "properties": {
      "ordenId": {
        "bsonType": "objectId"
      },
      "tecnicoId": {
        "bsonType": "objectId"
      },
      "servicio": {
        "bsonType": "object",
        "required": [
          "servicioId",
          "nombre",
          "descripcion"
        ],
        "properties": {
          "servicioId": {
            "bsonType": "objectId"
          },
          "nombre": {
            "bsonType": "string",
            "minLength": 1
          },
          "descripcion": {
            "bsonType": "string",
            "minLength": 1
          }
        }
      },
      "descripcionIntervencion": {
        "bsonType": "string",
        "minLength": 1
      },
      "componente": {
        "bsonType": "string",
        "minLength": 1
      },
      "manoObraEstimada": {
        "bsonType": [
          "int",
          "long",
          "double",
          "decimal"
        ],
        "minimum": 0
      },
      "repuestosPrevistos": {
        "bsonType": "array",
        "items": {
          "bsonType": "object",
          "required": [
            "repuestoId",
            "nombre",
            "especificaciones",
            "cantidad"
          ],
          "properties": {
            "repuestoId": {
              "bsonType": "objectId"
            },
            "nombre": {
              "bsonType": "string",
              "minLength": 1
            },
            "especificaciones": {
              "bsonType": "string",
              "minLength": 1
            },
            "cantidad": {
              "bsonType": [
                "int",
                "long",
                "double",
                "decimal"
              ],
              "minimum": 1
            },
            "precioUnitarioEstimado": {
              "bsonType": [
                "int",
                "long",
                "double",
                "decimal"
              ],
              "minimum": 0
            },
            "precioUnitarioAplicado": {
              "bsonType": [
                "int",
                "long",
                "double",
                "decimal"
              ],
              "minimum": 0
            }
          }
        }
      },
      "observaciones": {
        "bsonType": "string",
        "minLength": 1
      },
      "autorizacion": {
        "bsonType": "object",
        "required": [
          "decision"
        ],
        "properties": {
          "decision": {
            "bsonType": "string",
            "enum": [
              "pendiente",
              "autorizado",
              "rechazado"
            ]
          },
          "fecha": {
            "bsonType": "date"
          },
          "comentarios": {
            "bsonType": "string",
            "minLength": 1
          }
        }
      },
      "ejecucion": {
        "bsonType": "object",
        "required": [
          "estado",
          "fechaInicio",
          "descripcionRealizada",
          "repuestosUtilizados"
        ],
        "properties": {
          "estado": {
            "bsonType": "string",
            "enum": [
              "en ejecucion",
              "finalizado"
            ]
          },
          "fechaInicio": {
            "bsonType": "date"
          },
          "fechaFinalizacion": {
            "bsonType": "date"
          },
          "descripcionRealizada": {
            "bsonType": "string",
            "minLength": 1
          },
          "repuestosUtilizados": {
            "bsonType": "array",
            "items": {
              "bsonType": "object",
              "required": [
                "repuestoId",
                "nombre",
                "especificaciones",
                "cantidad"
              ],
              "properties": {
                "repuestoId": {
                  "bsonType": "objectId"
                },
                "nombre": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "especificaciones": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "cantidad": {
                  "bsonType": [
                    "int",
                    "long",
                    "double",
                    "decimal"
                  ],
                  "minimum": 1
                },
                "precioUnitarioEstimado": {
                  "bsonType": [
                    "int",
                    "long",
                    "double",
                    "decimal"
                  ],
                  "minimum": 0
                },
                "precioUnitarioAplicado": {
                  "bsonType": [
                    "int",
                    "long",
                    "double",
                    "decimal"
                  ],
                  "minimum": 0
                }
              }
            }
          }
        }
      },
      "revision": {
        "bsonType": "object",
        "required": [
          "puntosVerificados",
          "resultado",
          "aprobada",
          "recomendaciones"
        ],
        "properties": {
          "puntosVerificados": {
            "bsonType": "array",
            "items": {
              "bsonType": "object",
              "required": [
                "punto",
                "resultado"
              ],
              "properties": {
                "punto": {
                  "bsonType": "string",
                  "minLength": 1
                },
                "resultado": {
                  "bsonType": "string",
                  "minLength": 1
                }
              }
            }
          },
          "resultado": {
            "bsonType": "string",
            "minLength": 1
          },
          "aprobada": {
            "bsonType": "bool"
          },
          "recomendaciones": {
            "bsonType": "array",
            "items": {
              "bsonType": "string",
              "minLength": 1
            }
          }
        }
      },
      "garantia": {
        "bsonType": "object",
        "required": [
          "duracion",
          "fechaInicio",
          "condiciones",
          "exclusiones"
        ],
        "properties": {
          "duracion": {
            "bsonType": [
              "int",
              "long",
              "double",
              "decimal"
            ],
            "minimum": 1
          },
          "fechaInicio": {
            "bsonType": "date"
          },
          "condiciones": {
            "bsonType": "string",
            "minLength": 1
          },
          "exclusiones": {
            "bsonType": "string",
            "minLength": 1
          }
        }
      }
    }
  },
  "solicitudesGarantia": {
    "bsonType": "object",
    "required": [
      "trabajoId",
      "descripcion",
      "fecha",
      "evidencias",
      "estado"
    ],
    "properties": {
      "trabajoId": {
        "bsonType": "objectId"
      },
      "descripcion": {
        "bsonType": "string",
        "minLength": 1
      },
      "fecha": {
        "bsonType": "date"
      },
      "evidencias": {
        "bsonType": "array",
        "items": {
          "bsonType": "object",
          "required": [
            "nombreArchivo",
            "descripcion",
            "ubicacion"
          ],
          "properties": {
            "nombreArchivo": {
              "bsonType": "string",
              "minLength": 1
            },
            "descripcion": {
              "bsonType": "string",
              "minLength": 1
            },
            "ubicacion": {
              "bsonType": "string",
              "minLength": 1
            }
          }
        }
      },
      "estado": {
        "bsonType": "string",
        "enum": [
          "solicitada",
          "en revision",
          "resuelta",
          "rechazada"
        ]
      },
      "procede": {
        "bsonType": "bool"
      },
      "solucionAplicada": {
        "bsonType": "string",
        "minLength": 1
      }
    }
  }
};
for (const [name, schema] of Object.entries(schemas)) { db.createCollection(name, {validator: {$jsonSchema: schema}, validationLevel: "moderate", validationAction: "error"}); }
