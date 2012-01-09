#! /bin/sh

if [ -z $1 ]; then
    PROCESS='nfodb'
else
    PROCESS=$1
fi

ps -eo pid,pcpu,pmem,rsz,vsz,args|grep $PROCESS|egrep -v "grep|show_process"|awk 'BEGIN {i=0;cpu=0;mem=0;rsz=0;vsz=0;} { i+=1; cpu+=$2; mem+=$3; rsz+=$4; vsz+=$5} END {mrsz=rsz/1024;mvsz=vsz/1024;printf("CPU总使用率%2.1f%%,内存总使用率%2.1f%%,%d 个进程，物理内存占用 %2.1f兆，虚拟内存占用 %2.1f兆\n", cpu, mem, i, mrsz, mvsz)}'
