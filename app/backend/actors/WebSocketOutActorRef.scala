package backend.actors

import akka.actor.{ActorRef, PoisonPill}
import play.api.libs.json.{JsObject, Json, Writes}

case class WebSocketOutActorRef(private val id: Int, private val action: String, private val out: ActorRef) {
    def getAction: String = action

    def success[T](message: T)(implicit tWrites: Writes[T]): Unit = {
        this.send(message, WebSocketOutActorRef.ResponseStatus.SUCCESS)
    }

    def warning[T](message: T)(implicit tWrites: Writes[T]): Unit = {
        this.send(message, WebSocketOutActorRef.ResponseStatus.WARNING)
    }

    def error[T](message: T)(implicit tWrites: Writes[T]): Unit = {
        this.send(message, WebSocketOutActorRef.ResponseStatus.ERROR)
    }

    def close(): Unit = {
        out ! PoisonPill
    }

    def successMessage(message: String): Unit = {
        this.message(message, WebSocketOutActorRef.ResponseStatus.SUCCESS)
    }

    def warningMessage(message: String): Unit = {
        this.message(message, WebSocketOutActorRef.ResponseStatus.WARNING)
    }

    def errorMessage(message: String): Unit = {
        this.message(message, WebSocketOutActorRef.ResponseStatus.ERROR)
    }

    def handshake(): Unit = {
        out ! Json.toJson(Json.obj("id" -> id, "action" -> action))
    }

    private def message(message: String, status: String): Unit = {
        out ! Json.toJson(Json.obj("id" -> id, "action" -> action, "status" -> status, "message" -> message))
    }

    private def send[T](message: T, status: String)(implicit tWrites: Writes[T]): Unit = {
        out ! Json.toJson(Json.obj("id" -> id, "status" -> status, "action" -> action) ++ tWrites.writes(message).as[JsObject])
    }
}

object WebSocketOutActorRef {
    object ResponseStatus {
        final val SUCCESS: String = "success"
        final val WARNING: String = "warning"
        final val ERROR: String = "error"
    }
}