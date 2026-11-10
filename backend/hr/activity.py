from .models import Activity


def log_activity(actor, verb, target, description):
    """Record who did what to which object. target_type is e.g. 'employee'."""
    Activity.objects.create(
        actor=actor if actor and actor.is_authenticated else None,
        verb=verb,
        target_type=target._meta.model_name,
        target_id=target.pk,
        description=description,
    )
