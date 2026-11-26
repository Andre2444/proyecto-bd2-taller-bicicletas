package co.edu.uao.bicicletas;

import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.data.mongodb.UncategorizedMongoDbException;
import com.mongodb.MongoException;

@RestControllerAdvice
public class ApiErrors {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<?> handle(ApiException e) { return ResponseEntity.status(e.status()).body(Map.of("error", e.getMessage())); }
  @ExceptionHandler(DuplicateKeyException.class)
  ResponseEntity<?> duplicate() { return ResponseEntity.status(409).body(Map.of("error", "Registro duplicado o conflicto de cita/orden activa")); }
  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<?> malformed(HttpMessageNotReadableException e) { return ResponseEntity.badRequest().body(Map.of("error", "JSON inválido o incompleto")); }
  @ExceptionHandler(UncategorizedMongoDbException.class)
  ResponseEntity<?> mongo(UncategorizedMongoDbException e) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "El documento no cumple el esquema de MongoDB")); }
  @ExceptionHandler(MongoException.class)
  ResponseEntity<?> mongoWrite(MongoException e) {
    if(e.getCode()==11000)return ResponseEntity.status(409).body(Map.of("error","Registro duplicado o conflicto de cita/orden activa"));
    if(e.getCode()==121)return ResponseEntity.badRequest().body(Map.of("error","El documento no cumple el esquema de MongoDB"));
    System.err.println("Error MongoDB: " + e.getMessage());
    return ResponseEntity.status(500).body(Map.of("error","Error interno del servidor"));
  }
  @ExceptionHandler(Exception.class)
  ResponseEntity<?> invalid(Exception e) { System.err.println("Error interno de API: " + e.getMessage()); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error interno del servidor")); }
}
