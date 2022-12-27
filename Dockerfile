FROM apache/airflow:2.4.1

COPY user_auth.py /opt/airflow/
COPY webserver_config.py /opt/airflow/webserver_config.py
COPY airflow.cfg /opt/airflow/